<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Enqueue frontend styles and scripts
function rental_system_enqueue_scripts() {
    wp_enqueue_script('jquery');
    wp_enqueue_script('rental-system-js', plugin_dir_url(__FILE__) . 'assets/rental-system.js', array('jquery'), '1.0.0', true);
    wp_enqueue_style('rental-system-css', plugin_dir_url(__FILE__) . 'assets/rental-system.css', array(), '1.0.0');
    
    // Localize script for AJAX
    wp_localize_script('rental-system-js', 'rental_ajax', array(
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('rental_nonce')
    ));
}
add_action('wp_enqueue_scripts', 'rental_system_enqueue_scripts');

// Create Rental Bookings post type
function register_rental_bookings_post_type() {
    $labels = array(
        'name'                  => _x('Rental Bookings', 'Post Type General Name', 'text_domain'),
        'singular_name'         => _x('Rental Booking', 'Post Type Singular Name', 'text_domain'),
        'add_new_item'          => __('Add New Booking', 'text_domain'),
        'add_new'               => __('Add Booking', 'text_domain'),
        'edit_item'             => __('Edit Booking', 'text_domain'),
        'view_item'             => __('View Booking', 'text_domain'),
    );
    
    $args = array(
        'label'                 => __('Rental Booking', 'text_domain'),
        'labels'                => $labels,
        'supports'              => array('title', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => false,
        'show_ui'               => true,
        'show_in_menu'          => 'edit.php?post_type=gear',
        'menu_position'         => 10,
        'show_in_admin_bar'     => true,
        'can_export'            => true,
        'has_archive'           => false,
        'exclude_from_search'   => true,
        'publicly_queryable'    => false,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
    );
    
    register_post_type('rental_booking', $args);
}
add_action('init', 'register_rental_bookings_post_type', 0);

// Shortcode to display equipment catalog
function equipment_catalog_shortcode($atts) {
    $atts = shortcode_atts(array(
        'category' => '',
        'limit' => 12,
        'columns' => 3
    ), $atts);
    
    $args = array(
        'post_type' => 'gear',
        'posts_per_page' => intval($atts['limit']),
        'post_status' => 'publish'
    );
    
    if (!empty($atts['category'])) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'equipment_category',
                'field'    => 'slug',
                'terms'    => $atts['category'],
            ),
        );
    }
    
    $equipment_query = new WP_Query($args);
    
    if (!$equipment_query->have_posts()) {
        return '<p>Keine Ausrüstung gefunden.</p>';
    }
    
    ob_start();
    ?>
    <div class="equipment-catalog">
        <div class="equipment-grid columns-<?php echo esc_attr($atts['columns']); ?>">
            <?php while ($equipment_query->have_posts()) : $equipment_query->the_post(); ?>
                <?php
                $equipment_id = get_the_ID();
                $brand = get_post_meta($equipment_id, '_equipment_brand', true);
                $model = get_post_meta($equipment_id, '_equipment_model', true);
                $tagesmiete = get_post_meta($equipment_id, '_tagesmiete', true);
                $wochenendmiete = get_post_meta($equipment_id, '_wochenendmiete', true);
                $wochenmiete = get_post_meta($equipment_id, '_wochenmiete', true);
                $monatsmiete = get_post_meta($equipment_id, '_monatsmiete', true);
                $availability = get_post_meta($equipment_id, '_availability_status', true);
                $menge = get_post_meta($equipment_id, '_equipment_menge', true);
                
                $available_units = get_available_units_count($equipment_id);
                ?>
                <div class="equipment-item" data-equipment-id="<?php echo $equipment_id; ?>">
                    <div class="equipment-image">
                        <?php if (has_post_thumbnail()) : ?>
                            <?php the_post_thumbnail('medium'); ?>
                        <?php else : ?>
                            <div class="no-image-placeholder">
                                <i class="fas fa-microphone"></i>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="equipment-content">
                        <h3 class="equipment-title"><?php echo esc_html($brand . ' ' . $model); ?></h3>
                        
                        <div class="equipment-pricing">
                            <?php if ($tagesmiete) : ?>
                                <div class="price-item">
                                    <span class="price-label">Tagesmiete:</span>
                                    <span class="price-value">€<?php echo number_format($tagesmiete, 2); ?></span>
                                </div>
                            <?php endif; ?>
                            
                            <?php if ($wochenendmiete) : ?>
                                <div class="price-item">
                                    <span class="price-label">Wochenende:</span>
                                    <span class="price-value">€<?php echo number_format($wochenendmiete, 2); ?></span>
                                </div>
                            <?php endif; ?>
                            
                            <?php if ($wochenmiete) : ?>
                                <div class="price-item">
                                    <span class="price-label">Wochenmiete:</span>
                                    <span class="price-value">€<?php echo number_format($wochenmiete, 2); ?></span>
                                </div>
                            <?php endif; ?>
                        </div>
                        
                        <div class="equipment-availability">
                            <span class="availability-label">Verfügbar:</span>
                            <span class="availability-count"><?php echo $available_units; ?> von <?php echo $menge; ?></span>
                        </div>
                        
                        <button class="rental-request-btn" data-equipment-id="<?php echo $equipment_id; ?>" 
                                <?php echo ($available_units <= 0) ? 'disabled' : ''; ?>>
                            <?php echo ($available_units > 0) ? 'Anfrage senden' : 'Nicht verfügbar'; ?>
                        </button>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </div>
    
    <!-- Rental Request Modal -->
    <div id="rental-modal" class="rental-modal" style="display: none;">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Mietanfrage</h2>
            
            <form id="rental-request-form">
                <div class="form-group">
                    <label for="customer-name">Name *</label>
                    <input type="text" id="customer-name" name="customer_name" required>
                </div>
                
                <div class="form-group">
                    <label for="customer-email">E-Mail *</label>
                    <input type="email" id="customer-email" name="customer_email" required>
                </div>
                
                <div class="form-group">
                    <label for="customer-phone">Telefon</label>
                    <input type="tel" id="customer-phone" name="customer_phone">
                </div>
                
                <div class="form-group">
                    <label for="rental-start">Mietbeginn *</label>
                    <input type="date" id="rental-start" name="rental_start" required>
                </div>
                
                <div class="form-group">
                    <label for="rental-end">Mietende *</label>
                    <input type="date" id="rental-end" name="rental_end" required>
                </div>
                
                <div class="form-group">
                    <label for="quantity">Anzahl *</label>
                    <input type="number" id="quantity" name="quantity" min="1" max="1" required>
                </div>
                
                <div class="form-group">
                    <label for="customer-message">Nachricht</label>
                    <textarea id="customer-message" name="customer_message" rows="4"></textarea>
                </div>
                
                <div class="price-calculation">
                    <h3>Preisberechnung</h3>
                    <div id="price-breakdown"></div>
                    <div class="total-price">
                        <strong>Gesamtpreis: <span id="total-price">€0.00</span></strong>
                    </div>
                </div>
                
                <input type="hidden" id="equipment-id" name="equipment_id">
                
                <div class="form-actions">
                    <button type="button" class="cancel-btn">Abbrechen</button>
                    <button type="submit" class="submit-btn">Anfrage senden</button>
                </div>
            </form>
        </div>
    </div>
    
    <?php
    wp_reset_postdata();
    return ob_get_clean();
}
add_shortcode('equipment_catalog', 'equipment_catalog_shortcode');

// Shortcode for equipment category filter
function equipment_category_filter_shortcode($atts) {
    $atts = shortcode_atts(array(
        'show_all' => true,
        'show_search' => true
    ), $atts);
    
    $categories = get_terms(array(
        'taxonomy' => 'equipment_category',
        'hide_empty' => true,
    ));
    
    if (empty($categories) || is_wp_error($categories)) {
        return '';
    }
    
    ob_start();
    ?>
    <div class="equipment-filters">
        <?php if ($atts['show_search']) : ?>
        <div class="equipment-search">
            <input type="text" id="equipment-search" placeholder="Equipment suchen..." />
            <button type="button" id="search-btn"><i class="fas fa-search"></i></button>
        </div>
        <?php endif; ?>
        
        <div class="equipment-categories">
            <?php if ($atts['show_all']) : ?>
            <button class="category-filter active" data-category="">Alle</button>
            <?php endif; ?>
            
            <?php foreach ($categories as $category) : ?>
            <button class="category-filter" data-category="<?php echo esc_attr($category->slug); ?>">
                <?php echo esc_html($category->name); ?> (<?php echo $category->count; ?>)
            </button>
            <?php endforeach; ?>
        </div>
    </div>
    
    <style>
    .equipment-filters {
        margin-bottom: 30px;
        padding: 20px;
        background: #f8f8f8;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
    }
    
    .equipment-search {
        display: flex;
        margin-bottom: 20px;
        max-width: 400px;
    }
    
    .equipment-search input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid #ddd;
        border-radius: 6px 0 0 6px;
        font-size: 14px;
        background: #fff;
    }
    
    .equipment-search input:focus {
        outline: none;
        border-color: #333;
        box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.2);
    }
    
    .equipment-search button {
        padding: 10px 15px;
        background: #333;
        color: white;
        border: none;
        border-radius: 0 6px 6px 0;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .equipment-search button:hover {
        background: #1a1a1a;
    }
    
    .equipment-categories {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .category-filter {
        padding: 8px 16px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        color: #333;
    }
    
    .category-filter:hover {
        background: #333;
        color: white;
        border-color: #333;
    }
    
    .category-filter.active {
        background: #1a1a1a;
        color: white;
        border-color: #1a1a1a;
    }
    
    @media (max-width: 768px) {
        .equipment-categories {
            flex-direction: column;
        }
        
        .category-filter {
            text-align: center;
        }
    }
    </style>
    
    <script>
    jQuery(document).ready(function($) {
        // Category filtering
        $('.category-filter').on('click', function() {
            const category = $(this).data('category');
            
            $('.category-filter').removeClass('active');
            $(this).addClass('active');
            
            // Filter equipment items
            $('.equipment-item').show();
            
            if (category) {
                // Here you would implement AJAX filtering or hide/show items
                // For now, we'll reload with category parameter
                const currentUrl = new URL(window.location);
                if (category) {
                    currentUrl.searchParams.set('equipment_category', category);
                } else {
                    currentUrl.searchParams.delete('equipment_category');
                }
                window.location.href = currentUrl.href;
            }
        });
        
        // Search functionality
        $('#equipment-search').on('input', function() {
            const searchTerm = $(this).val().toLowerCase();
            
            $('.equipment-item').each(function() {
                const title = $(this).find('.equipment-title').text().toLowerCase();
                const visible = title.includes(searchTerm);
                $(this).toggle(visible);
            });
        });
        
        $('#search-btn').on('click', function() {
            $('#equipment-search').trigger('input');
        });
    });
    </script>
    <?php
    
    return ob_get_clean();
}
add_shortcode('equipment_category_filter', 'equipment_category_filter_shortcode');

// Function to get available units count
function get_available_units_count($equipment_id) {
    $total_units = get_post_meta($equipment_id, '_equipment_menge', true);
    
    // Get rented units from equipment_unit post type
    $rented_units = get_posts(array(
        'post_type' => 'equipment_unit',
        'posts_per_page' => -1,
        'meta_query' => array(
            array(
                'key' => '_parent_equipment',
                'value' => $equipment_id,
                'compare' => '='
            ),
            array(
                'key' => '_unit_status',
                'value' => 'vermietet',
                'compare' => '='
            )
        ),
        'fields' => 'ids'
    ));
    
    $available = intval($total_units) - count($rented_units);
    return max(0, $available);
}

// AJAX handler for rental requests
function handle_rental_request() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'rental_nonce')) {
        wp_die('Security check failed');
    }
    
    $equipment_id = intval($_POST['equipment_id']);
    $customer_name = sanitize_text_field($_POST['customer_name']);
    $customer_email = sanitize_email($_POST['customer_email']);
    $customer_phone = sanitize_text_field($_POST['customer_phone']);
    $rental_start = sanitize_text_field($_POST['rental_start']);
    $rental_end = sanitize_text_field($_POST['rental_end']);
    $quantity = intval($_POST['quantity']);
    $customer_message = sanitize_textarea_field($_POST['customer_message']);
    
    // Create rental booking
    $booking_title = sprintf(
        'Buchung: %s - %s (%s)',
        get_the_title($equipment_id),
        $customer_name,
        date('d.m.Y', strtotime($rental_start))
    );
    
    $booking_id = wp_insert_post(array(
        'post_title' => $booking_title,
        'post_type' => 'rental_booking',
        'post_status' => 'publish',
        'meta_input' => array(
            '_equipment_id' => $equipment_id,
            '_customer_name' => $customer_name,
            '_customer_email' => $customer_email,
            '_customer_phone' => $customer_phone,
            '_rental_start' => $rental_start,
            '_rental_end' => $rental_end,
            '_quantity' => $quantity,
            '_customer_message' => $customer_message,
            '_booking_status' => 'pending',
            '_booking_date' => current_time('mysql')
        )
    ));
    
    if ($booking_id) {
        // Send email notification to admin
        $admin_email = get_option('admin_email');
        $subject = 'Neue Mietanfrage - ' . get_the_title($equipment_id);
        
        $message = sprintf(
            "Eine neue Mietanfrage ist eingegangen:\n\n" .
            "Equipment: %s\n" .
            "Kunde: %s\n" .
            "E-Mail: %s\n" .
            "Telefon: %s\n" .
            "Mietbeginn: %s\n" .
            "Mietende: %s\n" .
            "Anzahl: %d\n" .
            "Nachricht: %s\n\n" .
            "Buchung bearbeiten: %s",
            get_the_title($equipment_id),
            $customer_name,
            $customer_email,
            $customer_phone,
            date('d.m.Y', strtotime($rental_start)),
            date('d.m.Y', strtotime($rental_end)),
            $quantity,
            $customer_message,
            admin_url('post.php?post=' . $booking_id . '&action=edit')
        );
        
        wp_mail($admin_email, $subject, $message);
        
        // Send confirmation email to customer
        $customer_subject = 'Bestätigung Ihrer Mietanfrage - Neck Tontechnik';
        $customer_message = sprintf(
            "Liebe/r %s,\n\n" .
            "vielen Dank für Ihre Mietanfrage. Wir haben folgende Anfrage erhalten:\n\n" .
            "Equipment: %s\n" .
            "Mietbeginn: %s\n" .
            "Mietende: %s\n" .
            "Anzahl: %d\n\n" .
            "Wir werden Ihre Anfrage schnellstmöglich bearbeiten und uns bei Ihnen melden.\n\n" .
            "Mit freundlichen Grüßen\n" .
            "Ihr Neck Tontechnik Team",
            $customer_name,
            get_the_title($equipment_id),
            date('d.m.Y', strtotime($rental_start)),
            date('d.m.Y', strtotime($rental_end)),
            $quantity
        );
        
        wp_mail($customer_email, $customer_subject, $customer_message);
        
        wp_send_json_success(array(
            'message' => 'Ihre Anfrage wurde erfolgreich gesendet. Sie erhalten eine Bestätigung per E-Mail.'
        ));
    } else {
        wp_send_json_error(array(
            'message' => 'Fehler beim Senden der Anfrage. Bitte versuchen Sie es erneut.'
        ));
    }
}
add_action('wp_ajax_rental_request', 'handle_rental_request');
add_action('wp_ajax_nopriv_rental_request', 'handle_rental_request');

// AJAX handler for price calculation
function calculate_rental_price() {
    if (!wp_verify_nonce($_POST['nonce'], 'rental_nonce')) {
        wp_die('Security check failed');
    }
    
    $equipment_id = intval($_POST['equipment_id']);
    $start_date = $_POST['start_date'];
    $end_date = $_POST['end_date'];
    $quantity = intval($_POST['quantity']);
    
    $start = new DateTime($start_date);
    $end = new DateTime($end_date);
    $interval = $start->diff($end);
    $days = $interval->days + 1; // Include both start and end date
    
    // Get pricing
    $tagesmiete = floatval(get_post_meta($equipment_id, '_tagesmiete', true));
    $wochenendmiete = floatval(get_post_meta($equipment_id, '_wochenendmiete', true));
    $wochenmiete = floatval(get_post_meta($equipment_id, '_wochenmiete', true));
    $monatsmiete = floatval(get_post_meta($equipment_id, '_monatsmiete', true));
    $kaution = floatval(get_post_meta($equipment_id, '_kaution', true));
    
    $rental_price = 0;
    $deposit_total = $kaution * $quantity;
    $breakdown = array();
    
    // Check if it's a weekend rental (Friday-Sunday)
    $is_weekend = false;
    if ($days == 3 && $start->format('N') == 5 && $end->format('N') == 7) {
        // Friday to Sunday
        $is_weekend = true;
    } elseif ($days == 2 && (
        ($start->format('N') == 5 && $end->format('N') == 6) || // Friday-Saturday
        ($start->format('N') == 6 && $end->format('N') == 7) || // Saturday-Sunday
        ($start->format('N') == 5 && $end->format('N') == 7)    // Friday-Sunday (2 days)
    )) {
        $is_weekend = true;
    }
    
    // Calculate best pricing based on duration
    if ($days >= 28 && $monatsmiete > 0) {
        $months = ceil($days / 28);
        $rental_price = $monatsmiete * $months * $quantity;
        $breakdown[] = sprintf('%d Monat(e) × €%.2f × %d Stück = €%.2f', $months, $monatsmiete, $quantity, $rental_price);
    } elseif ($days >= 7 && $wochenmiete > 0) {
        $weeks = ceil($days / 7);
        $rental_price = $wochenmiete * $weeks * $quantity;
        $breakdown[] = sprintf('%d Woche(n) × €%.2f × %d Stück = €%.2f', $weeks, $wochenmiete, $quantity, $rental_price);
    } elseif ($is_weekend && $wochenendmiete > 0) {
        // Weekend pricing (Friday-Sunday)
        $rental_price = $wochenendmiete * $quantity;
        $breakdown[] = sprintf('Wochenende × €%.2f × %d Stück = €%.2f', $wochenendmiete, $quantity, $rental_price);
    } else {
        // Daily pricing
        $rental_price = $tagesmiete * $days * $quantity;
        $breakdown[] = sprintf('%d Tag(e) × €%.2f × %d Stück = €%.2f', $days, $tagesmiete, $quantity, $rental_price);
    }
    
    // Add deposit to breakdown
    if ($kaution > 0) {
        $breakdown[] = sprintf('Kaution: €%.2f × %d Stück = €%.2f', $kaution, $quantity, $deposit_total);
    }
    
    // Total includes rental price + deposit
    $total_price = $rental_price + $deposit_total;
    
    wp_send_json_success(array(
        'total_price' => $total_price,
        'rental_price' => $rental_price,
        'breakdown' => $breakdown,
        'deposit' => $deposit_total,
        'days' => $days
    ));
}
add_action('wp_ajax_calculate_rental_price', 'calculate_rental_price');
add_action('wp_ajax_nopriv_calculate_rental_price', 'calculate_rental_price');

// AJAX handler for multi-equipment rental requests
function handle_multi_rental_request() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'rental_nonce')) {
        wp_die('Security check failed');
    }
    
    $customer_name = sanitize_text_field($_POST['customer_name']);
    $customer_email = sanitize_email($_POST['customer_email']);
    $customer_phone = sanitize_text_field($_POST['customer_phone']);
    $rental_start = sanitize_text_field($_POST['rental_start']);
    $rental_end = sanitize_text_field($_POST['rental_end']);
    $customer_message = sanitize_textarea_field($_POST['customer_message']);
    $cart_data = json_decode(stripslashes($_POST['cart_data']), true);
    
    if (empty($cart_data) || !is_array($cart_data)) {
        wp_send_json_error(array(
            'message' => 'Keine Equipment-Daten erhalten.'
        ));
        return;
    }
    
    // Create multi-rental booking
    $equipment_list = array();
    $total_quantity = 0;
    
    foreach ($cart_data as $item) {
        $equipment_title = get_the_title($item['equipmentId']);
        $equipment_list[] = sprintf('%s (%dx)', $equipment_title, $item['quantity']);
        $total_quantity += $item['quantity'];
    }
    
    $booking_title = sprintf(
        'Multi-Buchung: %s - %s (%s)',
        implode(', ', array_slice($equipment_list, 0, 2)) . (count($equipment_list) > 2 ? '...' : ''),
        $customer_name,
        date('d.m.Y', strtotime($rental_start))
    );
    
    $booking_id = wp_insert_post(array(
        'post_title' => $booking_title,
        'post_type' => 'rental_booking',
        'post_status' => 'publish',
        'meta_input' => array(
            '_customer_name' => $customer_name,
            '_customer_email' => $customer_email,
            '_customer_phone' => $customer_phone,
            '_rental_start' => $rental_start,
            '_rental_end' => $rental_end,
            '_customer_message' => $customer_message,
            '_booking_status' => 'pending',
            '_booking_date' => current_time('mysql'),
            '_booking_type' => 'multi',
            '_cart_data' => json_encode($cart_data),
            '_total_items' => count($cart_data),
            '_total_quantity' => $total_quantity
        )
    ));
    
    if ($booking_id) {
        // Send email notification to admin
        $admin_email = get_option('admin_email');
        $subject = 'Neue Multi-Mietanfrage - ' . count($cart_data) . ' Artikel';
        
        $equipment_details = '';
        foreach ($cart_data as $item) {
            $equipment_title = get_the_title($item['equipmentId']);
            $equipment_details .= sprintf("- %s (Anzahl: %d)\n", $equipment_title, $item['quantity']);
        }
        
        $message = sprintf(
            "Eine neue Multi-Mietanfrage ist eingegangen:\n\n" .
            "Kunde: %s\n" .
            "E-Mail: %s\n" .
            "Telefon: %s\n" .
            "Mietbeginn: %s\n" .
            "Mietende: %s\n" .
            "Anzahl Artikel: %d\n" .
            "Gesamtmenge: %d\n\n" .
            "Equipment:\n%s\n" .
            "Nachricht: %s\n\n" .
            "Buchung bearbeiten: %s",
            $customer_name,
            $customer_email,
            $customer_phone,
            date('d.m.Y', strtotime($rental_start)),
            date('d.m.Y', strtotime($rental_end)),
            count($cart_data),
            $total_quantity,
            $equipment_details,
            $customer_message,
            admin_url('post.php?post=' . $booking_id . '&action=edit')
        );
        
        wp_mail($admin_email, $subject, $message);
        
        // Send confirmation email to customer
        $customer_subject = 'Bestätigung Ihrer Multi-Mietanfrage - Neck Tontechnik';
        $customer_message = sprintf(
            "Liebe/r %s,\n\n" .
            "vielen Dank für Ihre Multi-Mietanfrage. Wir haben folgende Anfrage erhalten:\n\n" .
            "Mietbeginn: %s\n" .
            "Mietende: %s\n" .
            "Anzahl verschiedener Artikel: %d\n" .
            "Gesamtmenge: %d Stück\n\n" .
            "Equipment:\n%s\n" .
            "Wir werden Ihre Anfrage schnellstmöglich bearbeiten und uns bei Ihnen melden.\n\n" .
            "Mit freundlichen Grüßen\n" .
            "Ihr Neck Tontechnik Team",
            $customer_name,
            date('d.m.Y', strtotime($rental_start)),
            date('d.m.Y', strtotime($rental_end)),
            count($cart_data),
            $total_quantity,
            $equipment_details
        );
        
        wp_mail($customer_email, $customer_subject, $customer_message);
        
        wp_send_json_success(array(
            'message' => 'Ihre Multi-Anfrage wurde erfolgreich gesendet. Sie erhalten eine Bestätigung per E-Mail.'
        ));
    } else {
        wp_send_json_error(array(
            'message' => 'Fehler beim Senden der Anfrage. Bitte versuchen Sie es erneut.'
        ));
    }
}
add_action('wp_ajax_multi_rental_request', 'handle_multi_rental_request');
add_action('wp_ajax_nopriv_multi_rental_request', 'handle_multi_rental_request');

// AJAX handler for checking equipment availability for date range
function check_equipment_availability() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'rental_nonce')) {
        wp_die('Security check failed');
    }
    
    $start_date = sanitize_text_field($_POST['start_date']);
    $end_date = sanitize_text_field($_POST['end_date']);
    $category = sanitize_text_field($_POST['category'] ?? '');
    $limit = intval($_POST['limit'] ?? 50);
    $columns = intval($_POST['columns'] ?? 3);
    
    // Validate dates
    $start = new DateTime($start_date);
    $end = new DateTime($end_date);
    $today = new DateTime();
    $today->setTime(0, 0, 0);
    
    if ($start < $today) {
        wp_send_json_error(array(
            'message' => 'Das Startdatum darf nicht in der Vergangenheit liegen.'
        ));
    }
    
    if ($end < $start) {
        wp_send_json_error(array(
            'message' => 'Das Enddatum muss nach dem Startdatum liegen.'
        ));
    }
    
    // Calculate rental period info
    $interval = $start->diff($end);
    $days = $interval->days + 1;
    
    // Get equipment
    $args = array(
        'post_type' => 'gear',
        'posts_per_page' => $limit,
        'post_status' => 'publish'
    );
    
    if (!empty($category)) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'equipment_category',
                'field'    => 'slug',
                'terms'    => $category,
            ),
        );
    }
    
    $equipment_query = new WP_Query($args);
    
    if (!$equipment_query->have_posts()) {
        wp_send_json_error(array(
            'message' => 'Keine Ausrüstung für den gewählten Zeitraum verfügbar.'
        ));
    }
    
    $available_equipment = array();
    $total_available = 0;
    
    while ($equipment_query->have_posts()) {
        $equipment_query->the_post();
        $equipment_id = get_the_ID();
        
        // Check availability for this date range
        $available_units = get_available_units_for_period($equipment_id, $start_date, $end_date);
        
        if ($available_units > 0) {
            $brand = get_post_meta($equipment_id, '_equipment_brand', true);
            $model = get_post_meta($equipment_id, '_equipment_model', true);
            $tagesmiete = get_post_meta($equipment_id, '_tagesmiete', true);
            $wochenendmiete = get_post_meta($equipment_id, '_wochenendmiete', true);
            $wochenmiete = get_post_meta($equipment_id, '_wochenmiete', true);
            $monatsmiete = get_post_meta($equipment_id, '_monatsmiete', true);
            $kaution = get_post_meta($equipment_id, '_kaution', true);
            $menge = get_post_meta($equipment_id, '_equipment_menge', true);
            
            $thumbnail = '';
            if (has_post_thumbnail()) {
                $thumbnail = get_the_post_thumbnail($equipment_id, 'medium');
            }
            
            $available_equipment[] = array(
                'id' => $equipment_id,
                'title' => $brand . ' ' . $model,
                'brand' => $brand,
                'model' => $model,
                'daily_rate' => floatval($tagesmiete),
                'weekend_rate' => floatval($wochenendmiete),
                'weekly_rate' => floatval($wochenmiete),
                'monthly_rate' => floatval($monatsmiete),
                'deposit' => floatval($kaution),
                'total_units' => intval($menge),
                'available_units' => $available_units,
                'thumbnail' => $thumbnail
            );
            
            $total_available++;
        }
    }
    
    wp_reset_postdata();
    
    if (empty($available_equipment)) {
        wp_send_json_error(array(
            'message' => 'Keine Ausrüstung für den gewählten Zeitraum verfügbar.'
        ));
    }
    
    // Generate HTML for equipment grid
    ob_start();
    ?>
    <div class="equipment-grid columns-<?php echo $columns; ?>">
        <?php foreach ($available_equipment as $equipment) : ?>
            <div class="equipment-item" 
                 data-equipment-id="<?php echo $equipment['id']; ?>"
                 data-equipment-title="<?php echo esc_attr($equipment['title']); ?>"
                 data-daily-rate="<?php echo $equipment['daily_rate']; ?>"
                 data-weekend-rate="<?php echo $equipment['weekend_rate']; ?>"
                 data-weekly-rate="<?php echo $equipment['weekly_rate']; ?>"
                 data-monthly-rate="<?php echo $equipment['monthly_rate']; ?>"
                 data-deposit="<?php echo $equipment['deposit']; ?>"
                 data-available="<?php echo $equipment['available_units']; ?>">
                 
                <div class="equipment-image">
                    <?php if ($equipment['thumbnail']) : ?>
                        <?php echo $equipment['thumbnail']; ?>
                    <?php else : ?>
                        <div class="no-image-placeholder">
                            <i class="fas fa-microphone"></i>
                        </div>
                    <?php endif; ?>
                </div>
                
                <div class="equipment-content">
                    <h3 class="equipment-title"><?php echo esc_html($equipment['title']); ?></h3>
                    
                    <div class="equipment-pricing">
                        <?php if ($equipment['daily_rate']) : ?>
                            <div class="price-item">
                                <span class="price-label">Tagesmiete:</span>
                                <span class="price-value">€<?php echo number_format($equipment['daily_rate'], 2); ?></span>
                            </div>
                        <?php endif; ?>
                        
                        <?php if ($equipment['weekend_rate']) : ?>
                            <div class="price-item">
                                <span class="price-label">Wochenende:</span>
                                <span class="price-value">€<?php echo number_format($equipment['weekend_rate'], 2); ?></span>
                            </div>
                        <?php endif; ?>
                        
                        <?php if ($equipment['weekly_rate']) : ?>
                            <div class="price-item">
                                <span class="price-label">Wochenmiete:</span>
                                <span class="price-value">€<?php echo number_format($equipment['weekly_rate'], 2); ?></span>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <div class="equipment-availability">
                        <span class="availability-label">Verfügbar:</span>
                        <span class="availability-count"><?php echo $equipment['available_units']; ?> von <?php echo $equipment['total_units']; ?></span>
                    </div>
                    
                    <div class="quantity-selector">
                        <label for="qty-<?php echo $equipment['id']; ?>">Anzahl:</label>
                        <input type="number" 
                               id="qty-<?php echo $equipment['id']; ?>" 
                               class="quantity-input"
                               min="0" 
                               max="<?php echo $equipment['available_units']; ?>" 
                               value="0"
                               data-equipment-id="<?php echo $equipment['id']; ?>">
                    </div>
                    
                    <button class="add-to-cart-btn" data-equipment-id="<?php echo $equipment['id']; ?>">
                        Zum Warenkorb hinzufügen
                    </button>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
    <?php
    
    $equipment_html = ob_get_clean();
    
    // Period information
    $period_info = sprintf(
        '%s bis %s (%d Tag%s)',
        $start->format('d.m.Y'),
        $end->format('d.m.Y'),
        $days,
        $days === 1 ? '' : 'e'
    );
    
    wp_send_json_success(array(
        'equipment_html' => $equipment_html,
        'period_info' => $period_info,
        'total_available' => $total_available,
        'days' => $days,
        'start_date' => $start_date,
        'end_date' => $end_date
    ));
}
add_action('wp_ajax_check_equipment_availability', 'check_equipment_availability');
add_action('wp_ajax_nopriv_check_equipment_availability', 'check_equipment_availability');

// Function to get available units for a specific period
function get_available_units_for_period($equipment_id, $start_date, $end_date) {
    $total_units = get_post_meta($equipment_id, '_equipment_menge', true);
    
    // Get bookings that overlap with the requested period
    $overlapping_bookings = get_posts(array(
        'post_type' => 'rental_booking',
        'posts_per_page' => -1,
        'meta_query' => array(
            'relation' => 'AND',
            array(
                'relation' => 'OR',
                array(
                    'key' => '_equipment_id',
                    'value' => $equipment_id,
                    'compare' => '='
                ),
                array(
                    'key' => '_cart_data',
                    'value' => '"equipmentId":' . $equipment_id,
                    'compare' => 'LIKE'
                )
            ),
            array(
                'key' => '_booking_status',
                'value' => array('pending', 'confirmed'),
                'compare' => 'IN'
            ),
            array(
                'relation' => 'AND',
                array(
                    'key' => '_rental_start',
                    'value' => $end_date,
                    'compare' => '<='
                ),
                array(
                    'key' => '_rental_end',
                    'value' => $start_date,
                    'compare' => '>='
                )
            )
        ),
        'fields' => 'ids'
    ));
    
    $booked_quantity = 0;
    
    foreach ($overlapping_bookings as $booking_id) {
        $booking_type = get_post_meta($booking_id, '_booking_type', true);
        
        if ($booking_type === 'multi') {
            // Multi booking - check cart data
            $cart_data = get_post_meta($booking_id, '_cart_data', true);
            if ($cart_data) {
                $cart_items = json_decode($cart_data, true);
                if (is_array($cart_items)) {
                    foreach ($cart_items as $item) {
                        if ($item['equipmentId'] == $equipment_id) {
                            $booked_quantity += intval($item['quantity']);
                            break;
                        }
                    }
                }
            }
        } else {
            // Single booking
            $booking_equipment_id = get_post_meta($booking_id, '_equipment_id', true);
            if ($booking_equipment_id == $equipment_id) {
                $quantity = get_post_meta($booking_id, '_quantity', true);
                $booked_quantity += intval($quantity);
            }
        }
    }
    
    $available = intval($total_units) - $booked_quantity;
    return max(0, $available);
}

// Add rental booking meta boxes
function add_rental_booking_meta_boxes() {
    add_meta_box(
        'rental_booking_details',
        'Buchungsdetails',
        'rental_booking_details_callback',
        'rental_booking',
        'normal',
        'default'
    );
}
add_action('add_meta_boxes', 'add_rental_booking_meta_boxes');

// Rental booking meta box callback
function rental_booking_details_callback($post) {
    $equipment_id = get_post_meta($post->ID, '_equipment_id', true);
    $customer_name = get_post_meta($post->ID, '_customer_name', true);
    $customer_email = get_post_meta($post->ID, '_customer_email', true);
    $customer_phone = get_post_meta($post->ID, '_customer_phone', true);
    $rental_start = get_post_meta($post->ID, '_rental_start', true);
    $rental_end = get_post_meta($post->ID, '_rental_end', true);
    $quantity = get_post_meta($post->ID, '_quantity', true);
    $customer_message = get_post_meta($post->ID, '_customer_message', true);
    $booking_status = get_post_meta($post->ID, '_booking_status', true);
    $booking_date = get_post_meta($post->ID, '_booking_date', true);
    $booking_type = get_post_meta($post->ID, '_booking_type', true);
    $cart_data = get_post_meta($post->ID, '_cart_data', true);
    $total_items = get_post_meta($post->ID, '_total_items', true);
    $total_quantity = get_post_meta($post->ID, '_total_quantity', true);
    
    ?>
    <table class="form-table">
        <?php if ($booking_type === 'multi') : ?>
            <tr>
                <th><strong>Buchungstyp:</strong></th>
                <td>
                    <span style="background: #1a1a1a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;">
                        Multi-Buchung
                    </span>
                </td>
            </tr>
            <tr>
                <th><strong>Equipment (<?php echo $total_items; ?> Artikel):</strong></th>
                <td>
                    <?php 
                    if ($cart_data) {
                        $cart_items = json_decode($cart_data, true);
                        if (is_array($cart_items)) {
                            echo '<div style="background: #f8f8f8; padding: 15px; border-radius: 6px; margin: 10px 0;">';
                            foreach ($cart_items as $item) {
                                $equipment_title = get_the_title($item['equipmentId']);
                                $edit_link = get_edit_post_link($item['equipmentId']);
                                echo '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">';
                                echo '<div>';
                                if ($edit_link) {
                                    echo '<a href="' . $edit_link . '" target="_blank" style="font-weight: 600; text-decoration: none;">' . esc_html($equipment_title) . '</a>';
                                } else {
                                    echo '<span style="font-weight: 600;">' . esc_html($equipment_title) . '</span>';
                                }
                                echo '</div>';
                                echo '<div style="background: #333; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;">' . $item['quantity'] . 'x</div>';
                                echo '</div>';
                            }
                            echo '</div>';
                            echo '<div style="font-weight: 600; color: #1a1a1a;">Gesamtmenge: ' . $total_quantity . ' Stück</div>';
                        }
                    }
                    ?>
                </td>
            </tr>
        <?php else : ?>
            <tr>
                <th><strong>Equipment:</strong></th>
                <td>
                    <?php if ($equipment_id) : ?>
                        <a href="<?php echo get_edit_post_link($equipment_id); ?>" target="_blank">
                            <?php echo get_the_title($equipment_id); ?>
                        </a>
                    <?php endif; ?>
                </td>
            </tr>
            <tr>
                <th><strong>Anzahl:</strong></th>
                <td><?php echo esc_html($quantity); ?></td>
            </tr>
        <?php endif; ?>
        <tr>
            <th><strong>Kunde:</strong></th>
            <td><?php echo esc_html($customer_name); ?></td>
        </tr>
        <tr>
            <th><strong>E-Mail:</strong></th>
            <td><a href="mailto:<?php echo esc_attr($customer_email); ?>"><?php echo esc_html($customer_email); ?></a></td>
        </tr>
        <tr>
            <th><strong>Telefon:</strong></th>
            <td><?php echo esc_html($customer_phone); ?></td>
        </tr>
        <tr>
            <th><strong>Mietbeginn:</strong></th>
            <td><?php echo esc_html(date('d.m.Y', strtotime($rental_start))); ?></td>
        </tr>
        <tr>
            <th><strong>Mietende:</strong></th>
            <td><?php echo esc_html(date('d.m.Y', strtotime($rental_end))); ?></td>
        </tr>
        <tr>
            <th><strong>Status:</strong></th>
            <td>
                <select name="booking_status">
                    <option value="pending" <?php selected($booking_status, 'pending'); ?>>Ausstehend</option>
                    <option value="confirmed" <?php selected($booking_status, 'confirmed'); ?>>Bestätigt</option>
                    <option value="cancelled" <?php selected($booking_status, 'cancelled'); ?>>Storniert</option>
                    <option value="completed" <?php selected($booking_status, 'completed'); ?>>Abgeschlossen</option>
                </select>
            </td>
        </tr>
        <tr>
            <th><strong>Buchungsdatum:</strong></th>
            <td><?php echo esc_html(date('d.m.Y H:i', strtotime($booking_date))); ?></td>
        </tr>
        <?php if ($customer_message) : ?>
        <tr>
            <th><strong>Nachricht:</strong></th>
            <td><?php echo nl2br(esc_html($customer_message)); ?></td>
        </tr>
        <?php endif; ?>
    </table>
    <?php
}

// Save booking status
function save_rental_booking_meta($post_id) {
    if (isset($_POST['booking_status'])) {
        update_post_meta($post_id, '_booking_status', sanitize_text_field($_POST['booking_status']));
    }
}
add_action('save_post', 'save_rental_booking_meta');

// Register rental booking meta fields for REST API
function register_rental_booking_meta_for_rest_api() {
    $meta_fields = array(
        '_equipment_id' => 'integer',
        '_quantity' => 'integer',
        '_rental_start' => 'string',
        '_rental_end' => 'string',
        '_customer_name' => 'string',
        '_customer_email' => 'string',
        '_customer_phone' => 'string',
        '_customer_message' => 'string',
        '_booking_status' => 'string',
        '_booking_date' => 'string',
        '_booking_type' => 'string',
        '_cart_data' => 'string',
        '_total_items' => 'integer',
        '_total_quantity' => 'integer',
    );
    
    foreach ($meta_fields as $meta_field => $type) {
        register_meta('post', $meta_field, array(
            'object_subtype' => 'rental_booking',
            'type' => $type,
            'single' => true,
            'show_in_rest' => true,
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            }
        ));
    }
}
add_action('init', 'register_rental_booking_meta_for_rest_api');

// Shortcode for multi-equipment rental cart
function equipment_rental_cart_shortcode($atts) {
    $atts = shortcode_atts(array(
        'category' => '',
        'limit' => 50,
        'columns' => 3
    ), $atts);
    
    // Get all equipment initially
    $args = array(
        'post_type' => 'gear',
        'posts_per_page' => intval($atts['limit']),
        'post_status' => 'publish'
    );
    
    if (!empty($atts['category'])) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => 'equipment_category',
                'field'    => 'slug',
                'terms'    => $atts['category'],
            ),
        );
    }
    
    $equipment_query = new WP_Query($args);
    
    // Get categories for filter
    $categories = get_terms(array(
        'taxonomy' => 'equipment_category',
        'hide_empty' => true,
    ));
    
    ob_start();
    ?>
    <div class="rental-system-container">
        <!-- Left Sidebar: Filters -->
        <div class="rental-sidebar">
            <div class="sidebar-section">
                <h3>Mietzeitraum</h3>
                <div class="date-inputs">
                    <div class="date-group">
                        <label for="cart-rental-start">Mietbeginn</label>
                        <input type="date" id="cart-rental-start" name="rental_start">
                    </div>
                    <div class="date-group">
                        <label for="cart-rental-end">Mietende</label>
                        <input type="date" id="cart-rental-end" name="rental_end">
                    </div>
                </div>
                <div id="date-info" class="date-info" style="display: none;"></div>
            </div>
            
            <div class="sidebar-section">
                <h3>Kategorien</h3>
                <div class="category-filters">
                    <button class="category-filter active" data-category="">Alle</button>
                    <?php foreach ($categories as $category) : ?>
                    <button class="category-filter" data-category="<?php echo esc_attr($category->slug); ?>">
                        <?php echo esc_html($category->name); ?>
                    </button>
                    <?php endforeach; ?>
                </div>
            </div>
            
            <div class="sidebar-section">
                <h3>Suche</h3>
                <div class="search-input">
                    <input type="text" id="equipment-search" placeholder="Equipment suchen...">
                    <button type="button" id="search-btn"><i class="fas fa-search"></i></button>
                </div>
            </div>
        </div>
        
        <!-- Right Content: Equipment Grid -->
        <div class="rental-content">
            <div class="content-header">
                <h3>Verfügbare Ausrüstung</h3>
                <div id="availability-status" class="availability-status">
                    Wählen Sie Daten aus, um Verfügbarkeit zu prüfen
                </div>
            </div>
            
            <div id="equipment-grid" class="equipment-catalog multi-select">
                <div class="equipment-grid columns-<?php echo esc_attr($atts['columns']); ?>">
                    <?php while ($equipment_query->have_posts()) : $equipment_query->the_post(); ?>
                        <?php
                        $equipment_id = get_the_ID();
                        $brand = get_post_meta($equipment_id, '_equipment_brand', true);
                        $model = get_post_meta($equipment_id, '_equipment_model', true);
                        $tagesmiete = get_post_meta($equipment_id, '_tagesmiete', true);
                        $wochenendmiete = get_post_meta($equipment_id, '_wochenendmiete', true);
                        $wochenmiete = get_post_meta($equipment_id, '_wochenmiete', true);
                        $monatsmiete = get_post_meta($equipment_id, '_monatsmiete', true);
                        $kaution = get_post_meta($equipment_id, '_kaution', true);
                        $menge = get_post_meta($equipment_id, '_equipment_menge', true);
                        $total_available = get_available_units_count($equipment_id);
                        ?>
                        <div class="equipment-item" 
                             data-equipment-id="<?php echo $equipment_id; ?>"
                             data-equipment-title="<?php echo esc_attr($brand . ' ' . $model); ?>"
                             data-daily-rate="<?php echo esc_attr($tagesmiete); ?>"
                             data-weekend-rate="<?php echo esc_attr($wochenendmiete); ?>"
                             data-weekly-rate="<?php echo esc_attr($wochenmiete); ?>"
                             data-monthly-rate="<?php echo esc_attr($monatsmiete); ?>"
                             data-deposit="<?php echo esc_attr($kaution); ?>"
                             data-total-units="<?php echo esc_attr($menge); ?>"
                             data-category="<?php echo esc_attr(wp_get_post_terms($equipment_id, 'equipment_category', array('fields' => 'slugs'))[0] ?? ''); ?>">
                             
                            <div class="equipment-image">
                                <?php if (has_post_thumbnail()) : ?>
                                    <?php the_post_thumbnail('medium'); ?>
                                <?php else : ?>
                                    <div class="no-image-placeholder">
                                        <i class="fas fa-microphone"></i>
                                    </div>
                                <?php endif; ?>
                            </div>
                            
                            <div class="equipment-content">
                                <h4 class="equipment-title"><?php echo esc_html($brand . ' ' . $model); ?></h4>
                                
                                <div class="equipment-pricing">
                                    <?php if ($tagesmiete) : ?>
                                        <div class="price-item">
                                            <span class="price-label">Tagesmiete:</span>
                                            <span class="price-value">€<?php echo number_format($tagesmiete, 2); ?></span>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <?php if ($wochenendmiete) : ?>
                                        <div class="price-item">
                                            <span class="price-label">Wochenende:</span>
                                            <span class="price-value">€<?php echo number_format($wochenendmiete, 2); ?></span>
                                        </div>
                                    <?php endif; ?>
                                    
                                    <?php if ($wochenmiete) : ?>
                                        <div class="price-item">
                                            <span class="price-label">Wochenmiete:</span>
                                            <span class="price-value">€<?php echo number_format($wochenmiete, 2); ?></span>
                                        </div>
                                    <?php endif; ?>
                                </div>
                                
                                <div class="equipment-availability">
                                    <span class="availability-label">Gesamt verfügbar:</span>
                                    <span class="total-available"><?php echo $total_available; ?> von <?php echo $menge; ?></span>
                                    <span class="period-available" style="display: none;"></span>
                                </div>
                                
                                <div class="availability-indicator">
                                    <span class="status-badge status-unknown">Datum wählen</span>
                                </div>
                                
                                <div class="quantity-selector" style="display: none;">
                                    <label for="qty-<?php echo $equipment_id; ?>">Anzahl:</label>
                                    <input type="number" 
                                           id="qty-<?php echo $equipment_id; ?>" 
                                           class="quantity-input"
                                           min="0" 
                                           max="0" 
                                           value="0"
                                           data-equipment-id="<?php echo $equipment_id; ?>"
                                           disabled>
                                </div>
                                
                                <button class="add-to-cart-btn" 
                                        data-equipment-id="<?php echo $equipment_id; ?>"
                                        disabled
                                        style="display: none;">
                                    Zum Warenkorb hinzufügen
                                </button>
                            </div>
                        </div>
                    <?php endwhile; ?>
                </div>
            </div>
        </div>
    </div>

    <!-- Rental Cart (floating) -->
    <div id="rental-cart" class="rental-cart floating-cart" style="display: none;">
        <div class="cart-header">
            <h4>Warenkorb</h4>
            <button type="button" id="toggle-cart" class="toggle-cart-btn">
                <span class="cart-count">0</span>
                <i class="fas fa-shopping-cart"></i>
            </button>
        </div>
        <div class="cart-content">
            <div class="cart-rental-period">
                <div class="period-info">
                    <strong>Mietzeitraum:</strong>
                    <span id="cart-period-display">Bitte Datum wählen</span>
                </div>
                <div class="period-duration">
                    <span id="cart-duration-display"></span>
                </div>
            </div>
            <div id="cart-items"></div>
            <div class="cart-total">
                <strong>Gesamtpreis: <span id="cart-total-price">€0.00</span></strong>
            </div>
            <div class="cart-actions">
                <button type="button" id="clear-cart" class="clear-cart-btn">Leeren</button>
                <button type="button" id="proceed-checkout" class="checkout-btn" disabled>Zur Kasse</button>
            </div>
        </div>
    </div>
    
    <style>
    .rental-system-container {
        display: flex;
        gap: 30px;
        max-width: 1200px;
        margin: 0 auto;
    }
    
    .rental-sidebar {
        flex: 0 0 280px;
        background: #f8f8f8;
        padding: 25px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        height: fit-content;
        position: sticky;
        top: 20px;
    }
    
    .sidebar-section {
        margin-bottom: 30px;
    }
    
    .sidebar-section:last-child {
        margin-bottom: 0;
    }
    
    .sidebar-section h3 {
        margin: 0 0 15px 0;
        color: #1a1a1a;
        font-size: 1.1em;
        font-weight: 600;
    }
    
    .date-inputs {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .date-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #333;
        font-size: 0.9em;
    }
    
    .date-group input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        background: white;
        box-sizing: border-box;
    }
    
    .date-group input:focus {
        outline: none;
        border-color: #333;
        box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.1);
    }
    
    .date-info {
        margin-top: 15px;
        padding: 12px;
        background: white;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
        font-size: 0.9em;
    }
    
    .date-info.success {
        border-color: #28a745;
        background: #f8fff9;
        color: #155724;
    }
    
    .date-info.warning {
        border-color: #ffc107;
        background: #fffdf5;
        color: #856404;
    }
    
    .category-filters {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .category-filter {
        padding: 10px 15px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        color: #333;
        text-align: left;
    }
    
    .category-filter:hover {
        background: #333;
        color: white;
        border-color: #333;
    }
    
    .category-filter.active {
        background: #1a1a1a;
        color: white;
        border-color: #1a1a1a;
    }
    
    .search-input {
        display: flex;
        gap: 0;
    }
    
    .search-input input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px 0 0 6px;
        font-size: 14px;
        background: white;
        border-right: none;
    }
    
    .search-input input:focus {
        outline: none;
        border-color: #333;
        box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.1);
    }
    
    .search-input button {
        padding: 10px 12px;
        background: #333;
        color: white;
        border: 1px solid #333;
        border-radius: 0 6px 6px 0;
        cursor: pointer;
        transition: background 0.3s ease;
    }
    
    .search-input button:hover {
        background: #1a1a1a;
    }
    
    .rental-content {
        flex: 1;
        min-width: 0;
    
    }

    .rental-content h3 {
      color: white;
    }
    
    .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e0e0e0;
    }
    
    .content-header h3 {
        margin: 0;
        color: white;
        font-size: 1.3em;
    }
    
    .availability-status {
        background: #f8f8f8;
        padding: 8px 15px;
        border-radius: 6px;
        border: 1px solid #e0e0e0;
        font-size: 0.9em;
        color: #666;
    }
    
    .availability-status.checking {
        background: #fff8dc;
        border-color: #ffc107;
        color: #856404;
    }
    
    .availability-status.checked {
        background: #f8fff9;
        border-color: #28a745;
        color: #155724;
    }
    
    .equipment-item {
        position: relative;
    }
    
    .availability-indicator {
        margin: 10px 0;
    }
    
    .status-badge {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .status-unknown {
        background: #f8f8f8;
        color: #666;
        border: 1px solid #ddd;
    }
    
    .status-available {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .status-limited {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
    }
    
    .status-unavailable {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .equipment-item.unavailable {
        opacity: 0.6;
    }
    
    .equipment-item.unavailable .equipment-content {
        pointer-events: none;
    }
    
    .period-available {
        display: block !important;
        font-weight: 600;
        color: #1a1a1a;
        margin-top: 5px;
    }
    
    .floating-cart {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 350px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        border: 1px solid #e0e0e0;
        z-index: 1000;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    .floating-cart .cart-header {
        background: #1a1a1a;
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
    }
    
    .floating-cart .cart-header h4 {
        margin: 0;
        font-size: 1em;
    }
    
    .toggle-cart-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
    }
    
    .cart-count {
        background: #dc3545;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8em;
    }
    
    .floating-cart .cart-content {
        padding: 20px;
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .cart-rental-period {
        padding-bottom: 15px;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 15px;
    }
    
    .period-info {
        font-size: 0.9em;
        margin-bottom: 5px;
    }
    
    .period-duration {
        color: #666;
        font-size: 0.8em;
    }
    
    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .cart-item:last-child {
        border-bottom: none;
    }
    
    .cart-item-info {
        flex: 1;
    }
    
    .cart-item-title {
        font-weight: 600;
        color: #1a1a1a;
        font-size: 0.9em;
    }
    
    .cart-item-quantity {
        color: #666;
        font-size: 0.8em;
    }
    
    .cart-item-remove {
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .cart-total {
        margin: 15px 0;
        padding: 15px 0;
        border-top: 2px solid #1a1a1a;
        text-align: center;
        color: #1a1a1a;
    }
    
    .cart-actions {
        display: flex;
        gap: 10px;
    }
    
    .clear-cart-btn {
        background: #666;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9em;
        flex: 1;
    }
    
    .checkout-btn {
        background: #1a1a1a;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        flex: 2;
        font-size: 0.9em;
    }
    
    .checkout-btn:hover:not(:disabled) {
        background: #333;
    }
    
    .checkout-btn:disabled {
        background: #999;
        cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
        .rental-system-container {
            flex-direction: column;
            gap: 20px;
        }
        
        .rental-sidebar {
            flex: none;
            position: static;
        }
        
        .sidebar-section {
            margin-bottom: 20px;
        }
        
        .floating-cart {
            width: 300px;
            right: 10px;
            bottom: 10px;
        }
        
        .content-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
        }
    }
    </style>
    
    <?php
    wp_reset_postdata();
    return ob_get_clean();
}
add_shortcode('equipment_rental_cart', 'equipment_rental_cart_shortcode');

// Shortcode for checkout page
function equipment_checkout_shortcode($atts) {
    $atts = shortcode_atts(array(), $atts);
    
    ob_start();
    ?>
    <div class="equipment-checkout">
        <div id="checkout-loading" style="display: none;">
            <p>Lade Checkout-Daten...</p>
        </div>
        
        <div id="checkout-content" style="display: none;">
            <div class="checkout-sections">
                <!-- Rental Period Summary -->
                <div class="checkout-section">
                    <h3>Mietzeitraum</h3>
                    <div id="checkout-period-summary"></div>
                </div>
                
                <!-- Equipment Summary -->
                <div class="checkout-section">
                    <h3>Ausgewählte Ausrüstung</h3>
                    <div id="checkout-equipment-list"></div>
                </div>
                
                <!-- Price Breakdown -->
                <div class="checkout-section">
                    <h3>Preisberechnung</h3>
                    <div id="checkout-price-breakdown"></div>
                    <div class="checkout-total">
                        <strong>Gesamtpreis: <span id="checkout-total-price">€0.00</span></strong>
                    </div>
                </div>
                
                <!-- Customer Information Form -->
                <div class="checkout-section">
                    <h3>Ihre Kontaktdaten</h3>
                    <form id="checkout-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="checkout-customer-name">Name *</label>
                                <input type="text" id="checkout-customer-name" name="customer_name" required>
                            </div>
                            <div class="form-group">
                                <label for="checkout-customer-email">E-Mail *</label>
                                <input type="email" id="checkout-customer-email" name="customer_email" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="checkout-customer-phone">Telefon</label>
                                <input type="tel" id="checkout-customer-phone" name="customer_phone">
                            </div>
                            <div class="form-group">
                                <label for="checkout-customer-company">Firma (optional)</label>
                                <input type="text" id="checkout-customer-company" name="customer_company">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="checkout-customer-message">Nachricht (optional)</label>
                            <textarea id="checkout-customer-message" name="customer_message" rows="4" placeholder="Besondere Wünsche oder Anmerkungen..."></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" id="back-to-cart" class="back-btn">Zurück zum Warenkorb</button>
                            <button type="submit" id="submit-checkout" class="submit-checkout-btn">Anfrage verbindlich senden</button>
                        </div>
                        
                        <input type="hidden" id="checkout-cart-data" name="cart_data">
                        <input type="hidden" id="checkout-rental-start" name="rental_start">
                        <input type="hidden" id="checkout-rental-end" name="rental_end">
                    </form>
                </div>
            </div>
        </div>
        
        <div id="checkout-empty" style="display: none;">
            <div class="empty-checkout">
                <h3>Ihr Warenkorb ist leer</h3>
                <p>Sie haben noch keine Ausrüstung ausgewählt.</p>
                <a href="javascript:history.back()" class="back-link">← Zurück zur Ausrüstungsauswahl</a>
            </div>
        </div>
    </div>
    
    <style>
    .equipment-checkout {
        max-width: 800px;
        margin: 0 auto;
    }
    
    .checkout-sections {
        display: flex;
        flex-direction: column;
        gap: 30px;
    }
    
    .checkout-section {
        background: white;
        padding: 25px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .checkout-section h3 {
        margin-top: 0;
        margin-bottom: 20px;
        color: #1a1a1a;
        font-size: 1.2em;
        border-bottom: 2px solid #1a1a1a;
        padding-bottom: 10px;
    }
    
    .period-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f8f8;
        padding: 15px;
        border-radius: 6px;
    }
    
    .period-dates {
        font-size: 1.1em;
        font-weight: 600;
        color: #1a1a1a;
    }
    
    .period-duration {
        color: #666;
        font-size: 0.9em;
    }
    
    .equipment-item-checkout {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .equipment-item-checkout:last-child {
        border-bottom: none;
    }
    
    .item-info {
        flex: 1;
    }
    
    .item-title {
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 5px;
    }
    
    .item-details {
        color: #666;
        font-size: 0.9em;
    }
    
    .item-quantity {
        background: #333;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        font-weight: 600;
        margin-left: 15px;
    }
    
    .price-breakdown-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .price-breakdown-item:last-child {
        border-bottom: none;
    }
    
    .price-breakdown-item.deposit {
        color: #666;
        font-style: italic;
    }
    
    .checkout-total {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 2px solid #1a1a1a;
        text-align: right;
        font-size: 1.2em;
        color: #1a1a1a;
    }
    
    .form-row {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .form-group {
        flex: 1;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #1a1a1a;
    }
    
    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 16px;
        background: white;
        box-sizing: border-box;
    }
    
    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #333;
        box-shadow: 0 0 0 2px rgba(51, 51, 51, 0.2);
    }
    
    .form-actions {
        display: flex;
        gap: 20px;
        margin-top: 30px;
        justify-content: space-between;
    }
    
    .back-btn {
        background: #666;
        color: white;
        border: none;
        padding: 15px 25px;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .back-btn:hover {
        background: #555;
    }
    
    .submit-checkout-btn {
        background: #1a1a1a;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
        max-width: 300px;
    }
    
    .submit-checkout-btn:hover {
        background: #333;
    }
    
    .submit-checkout-btn:disabled {
        background: #999;
        cursor: not-allowed;
    }
    
    .empty-checkout {
        text-align: center;
        padding: 60px 20px;
        background: #f8f8f8;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
    }
    
    .empty-checkout h3 {
        color: #1a1a1a;
        margin-bottom: 15px;
    }
    
    .empty-checkout p {
        color: #666;
        margin-bottom: 25px;
    }
    
    .back-link {
        display: inline-block;
        background: #333;
        color: white;
        padding: 12px 20px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    
    .back-link:hover {
        background: #1a1a1a;
        color: white;
        text-decoration: none;
    }
    
    @media (max-width: 768px) {
        .form-row {
            flex-direction: column;
            gap: 0;
        }
        
        .form-actions {
            flex-direction: column;
        }
        
        .submit-checkout-btn {
            max-width: none;
        }
        
        .period-summary {
            flex-direction: column;
            gap: 10px;
            text-align: center;
        }
        
        .equipment-item-checkout {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
        
        .item-quantity {
            margin-left: 0;
        }
    }
    </style>
    
    <?php
    return ob_get_clean();
}
add_shortcode('equipment_checkout', 'equipment_checkout_shortcode');

// AJAX handler for updating equipment availability status
function update_equipment_availability_status() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'rental_nonce')) {
        wp_die('Security check failed');
    }
    
    $start_date = sanitize_text_field($_POST['start_date']);
    $end_date = sanitize_text_field($_POST['end_date']);
    $equipment_ids = array_map('intval', $_POST['equipment_ids'] ?? []);
    
    if (empty($equipment_ids)) {
        wp_send_json_error(array(
            'message' => 'Keine Equipment-IDs erhalten.'
        ));
    }
    
    // Validate dates
    $start = new DateTime($start_date);
    $end = new DateTime($end_date);
    $today = new DateTime();
    $today->setTime(0, 0, 0);
    
    if ($start < $today) {
        wp_send_json_error(array(
            'message' => 'Das Startdatum darf nicht in der Vergangenheit liegen.'
        ));
    }
    
    if ($end < $start) {
        wp_send_json_error(array(
            'message' => 'Das Enddatum muss nach dem Startdatum liegen.'
        ));
    }
    
    // Calculate rental period info
    $interval = $start->diff($end);
    $days = $interval->days + 1;
    
    $equipment_status = array();
    $total_available = 0;
    $total_equipment = count($equipment_ids);
    
    foreach ($equipment_ids as $equipment_id) {
        $available_units = get_available_units_for_period($equipment_id, $start_date, $end_date);
        $total_units = get_post_meta($equipment_id, '_equipment_menge', true);
        
        $status = 'unavailable';
        $status_text = 'Nicht verfügbar';
        $status_class = 'status-unavailable';
        
        if ($available_units > 0) {
            $total_available++;
            
            if ($available_units >= $total_units) {
                $status = 'available';
                $status_text = 'Verfügbar';
                $status_class = 'status-available';
            } else {
                $status = 'limited';
                $status_text = 'Begrenzt verfügbar';
                $status_class = 'status-limited';
            }
        }
        
        $equipment_status[$equipment_id] = array(
            'status' => $status,
            'status_text' => $status_text,
            'status_class' => $status_class,
            'available_units' => $available_units,
            'total_units' => intval($total_units),
            'period_text' => sprintf('%d von %d verfügbar', $available_units, intval($total_units))
        );
    }
    
    // Period information
    $period_info = sprintf(
        '%s bis %s (%d Tag%s)',
        $start->format('d.m.Y'),
        $end->format('d.m.Y'),
        $days,
        $days === 1 ? '' : 'e'
    );
    
    $status_summary = sprintf(
        '%d von %d Artikeln verfügbar für gewählten Zeitraum',
        $total_available,
        $total_equipment
    );
    
    wp_send_json_success(array(
        'equipment_status' => $equipment_status,
        'period_info' => $period_info,
        'status_summary' => $status_summary,
        'total_available' => $total_available,
        'total_equipment' => $total_equipment,
        'days' => $days,
        'start_date' => $start_date,
        'end_date' => $end_date
    ));
}
add_action('wp_ajax_update_equipment_availability_status', 'update_equipment_availability_status');
add_action('wp_ajax_nopriv_update_equipment_availability_status', 'update_equipment_availability_status');