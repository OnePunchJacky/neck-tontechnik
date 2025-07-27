<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Register Equipment Post Type
function register_gear_post_type()
{
    $labels = array(
        'name'                  => _x('Equipment', 'Post Type General Name', 'text_domain'),
        'singular_name'         => _x('Equipment', 'Post Type Singular Name', 'text_domain'),
        'add_new_item'          => __('Equipment anlegen', 'text_domain'),
        'add_new'          => __('Equipment anlegen', 'text_domain'),
    );
    $args = array(
        'label'                 => __('Equipment', 'text_domain'),
        'labels'                => $labels,
        'supports'              => array('custom-fields'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 8,
        'menu_icon'             => 'dashicons-microphone',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'taxonomies'            => array('equipment_category'),
    );
    register_post_type('gear', $args);
}
add_action('init', 'register_gear_post_type', 0);

// Add Custom Meta Box for Equipment Fields
function add_equipment_meta_boxes() {
    add_meta_box(
        'equipment_details',
        'Equipment Details',
        'equipment_details_callback',
        'gear',
        'normal',
        'default'
    );
}
add_action('add_meta_boxes', 'add_equipment_meta_boxes');

// Meta Box Callback Function
function equipment_details_callback($post) {
    // Add nonce for security
    wp_nonce_field(basename(__FILE__), 'equipment_nonce');
    
    // Get current values
    $equipment_brand = get_post_meta($post->ID, '_equipment_brand', true);
    $equipment_model = get_post_meta($post->ID, '_equipment_model', true);
    $equipment_menge = get_post_meta($post->ID, '_equipment_menge', true);
    $equipment_preis = get_post_meta($post->ID, '_equipment_preis', true);
    
    // Rental fields
    $tagesmiete = get_post_meta($post->ID, '_tagesmiete', true);
    $wochenendmiete = get_post_meta($post->ID, '_wochenendmiete', true);
    $wochenmiete = get_post_meta($post->ID, '_wochenmiete', true);
    $monatsmiete = get_post_meta($post->ID, '_monatsmiete', true);
    $kaution = get_post_meta($post->ID, '_kaution', true);
    $availability_status = get_post_meta($post->ID, '_availability_status', true);
    $insurance_value = get_post_meta($post->ID, '_insurance_value', true);
    $location = get_post_meta($post->ID, '_location', true);
    $last_maintenance = get_post_meta($post->ID, '_last_maintenance', true);
    $next_maintenance = get_post_meta($post->ID, '_next_maintenance', true);
    $rental_notes = get_post_meta($post->ID, '_rental_notes', true);
    
    ?>
    <style>
    /* Hide title field for Equipment */
    .post-type-gear #titlediv {
        display: none !important;
    }
    .equipment-tabs {
        border-bottom: 1px solid #ccd0d4;
        margin-bottom: 20px;
    }
    .equipment-tabs button {
        background: none;
        border: none;
        padding: 10px 15px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
    }
    .equipment-tabs button.active {
        border-bottom-color: #0073aa;
        color: #0073aa;
    }
    .tab-content {
        display: none;
    }
    .tab-content.active {
        display: block;
    }
    </style>
    
    <div class="equipment-tabs">
        <button type="button" class="tab-button active" data-tab="general">Allgemein</button>
        <button type="button" class="tab-button" data-tab="rental">Vermietung</button>
        <button type="button" class="tab-button" data-tab="maintenance">Wartung</button>
    </div>
    
    <div id="general-tab" class="tab-content active">
        <table class="form-table">
            <tr>
                <th><label for="equipment_brand">Marke</label></th>
                <td><input type="text" id="equipment_brand" name="equipment_brand" value="<?php echo esc_attr($equipment_brand); ?>" size="30" /></td>
            </tr>
            <tr>
                <th><label for="equipment_model">Modell</label></th>
                <td><input type="text" id="equipment_model" name="equipment_model" value="<?php echo esc_attr($equipment_model); ?>" size="30" /></td>
            </tr>
            <tr>
                <th><label for="equipment_menge">Menge</label></th>
                <td><input type="number" id="equipment_menge" name="equipment_menge" value="<?php echo esc_attr($equipment_menge); ?>" min="0" /></td>
            </tr>
            <tr>
                <th><label for="equipment_preis">Anschaffungspreis (€)</label></th>
                <td><input type="number" id="equipment_preis" name="equipment_preis" value="<?php echo esc_attr($equipment_preis); ?>" step="0.01" min="0" /></td>
            </tr>
            <tr>
                <th><label for="location">Lagerort</label></th>
                <td><input type="text" id="location" name="location" value="<?php echo esc_attr($location); ?>" size="30" /></td>
            </tr>
        </table>
    </div>
    
    <div id="rental-tab" class="tab-content">
        <table class="form-table">
            <tr>
                <th><label for="tagesmiete">Tagesmiete (€)</label></th>
                <td><input type="number" id="tagesmiete" name="tagesmiete" value="<?php echo esc_attr($tagesmiete); ?>" step="0.01" min="0" /></td>
            </tr>
            <tr>
                <th><label for="wochenendmiete">Wochenendmiete (€)</label></th>
                <td><input type="number" id="wochenendmiete" name="wochenendmiete" value="<?php echo esc_attr($wochenendmiete); ?>" step="0.01" min="0" /></td>
            </tr>
            <tr>
                <th><label for="wochenmiete">Wochenmiete (€)</label></th>
                <td><input type="number" id="wochenmiete" name="wochenmiete" value="<?php echo esc_attr($wochenmiete); ?>" step="0.01" min="0" /></td>
            </tr>
            <tr>
                <th><label for="monatsmiete">Monatsmiete (€)</label></th>
                <td><input type="number" id="monatsmiete" name="monatsmiete" value="<?php echo esc_attr($monatsmiete); ?>" step="0.01" min="0" /></td>
            </tr>
            <tr>
                <th><label for="kaution">Kaution (€)</label></th>
                <td><input type="number" id="kaution" name="kaution" value="<?php echo esc_attr($kaution); ?>" step="0.01" min="0" /></td>
            </tr>
            <tr>
                <th><label for="insurance_value">Versicherungswert (€)</label></th>
                <td><input type="number" id="insurance_value" name="insurance_value" value="<?php echo esc_attr($insurance_value); ?>" step="0.01" min="0" /></td>
            </tr>
            <tr>
                <th><label for="availability_status">Verfügbarkeitsstatus</label></th>
                <td>
                    <select id="availability_status" name="availability_status">
                        <option value="verfügbar" <?php selected($availability_status, 'verfügbar'); ?>>Verfügbar</option>
                        <option value="vermietet" <?php selected($availability_status, 'vermietet'); ?>>Vermietet</option>
                        <option value="wartung" <?php selected($availability_status, 'wartung'); ?>>In Wartung</option>
                        <option value="reparatur" <?php selected($availability_status, 'reparatur'); ?>>In Reparatur</option>
                        <option value="nicht_verfügbar" <?php selected($availability_status, 'nicht_verfügbar'); ?>>Nicht verfügbar</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th><label for="rental_notes">Vermietungshinweise</label></th>
                <td><textarea id="rental_notes" name="rental_notes" rows="4" cols="50"><?php echo esc_textarea($rental_notes); ?></textarea></td>
            </tr>
        </table>
    </div>
    
    <div id="maintenance-tab" class="tab-content">
        <table class="form-table">
            <tr>
                <th><label for="last_maintenance">Letzte Wartung</label></th>
                <td><input type="date" id="last_maintenance" name="last_maintenance" value="<?php echo esc_attr($last_maintenance); ?>" /></td>
            </tr>
            <tr>
                <th><label for="next_maintenance">Nächste Wartung</label></th>
                <td><input type="date" id="next_maintenance" name="next_maintenance" value="<?php echo esc_attr($next_maintenance); ?>" /></td>
            </tr>
        </table>
    </div>
    
    <script>
    jQuery(document).ready(function($) {
        $('.tab-button').click(function() {
            var tab = $(this).data('tab');
            
            $('.tab-button').removeClass('active');
            $(this).addClass('active');
            
            $('.tab-content').removeClass('active');
            $('#' + tab + '-tab').addClass('active');
        });
    });
    </script>
    <?php
}

// Save Custom Fields
function save_equipment_meta_data($post_id) {
    // Verify nonce
    if (!isset($_POST['equipment_nonce']) || !wp_verify_nonce($_POST['equipment_nonce'], basename(__FILE__))) {
        return $post_id;
    }

    // Check if user has permission to edit
    if (!current_user_can('edit_post', $post_id)) {
        return $post_id;
    }

    // Don't save during autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return $post_id;
    }

    // Save custom fields
    // General fields
    if (isset($_POST['equipment_brand'])) {
        update_post_meta($post_id, '_equipment_brand', sanitize_text_field($_POST['equipment_brand']));
    }
    
    if (isset($_POST['equipment_model'])) {
        update_post_meta($post_id, '_equipment_model', sanitize_text_field($_POST['equipment_model']));
    }
    
    if (isset($_POST['equipment_menge'])) {
        update_post_meta($post_id, '_equipment_menge', intval($_POST['equipment_menge']));
    }
    
    if (isset($_POST['equipment_preis'])) {
        update_post_meta($post_id, '_equipment_preis', floatval($_POST['equipment_preis']));
    }
    
    if (isset($_POST['location'])) {
        update_post_meta($post_id, '_location', sanitize_text_field($_POST['location']));
    }
    
    // Rental fields
    if (isset($_POST['tagesmiete'])) {
        update_post_meta($post_id, '_tagesmiete', floatval($_POST['tagesmiete']));
    }
    
    if (isset($_POST['wochenendmiete'])) {
        update_post_meta($post_id, '_wochenendmiete', floatval($_POST['wochenendmiete']));
    }
    
    if (isset($_POST['wochenmiete'])) {
        update_post_meta($post_id, '_wochenmiete', floatval($_POST['wochenmiete']));
    }
    
    if (isset($_POST['monatsmiete'])) {
        update_post_meta($post_id, '_monatsmiete', floatval($_POST['monatsmiete']));
    }
    
    if (isset($_POST['kaution'])) {
        update_post_meta($post_id, '_kaution', floatval($_POST['kaution']));
    }
    
    if (isset($_POST['availability_status'])) {
        update_post_meta($post_id, '_availability_status', sanitize_text_field($_POST['availability_status']));
    }
    
    if (isset($_POST['insurance_value'])) {
        update_post_meta($post_id, '_insurance_value', floatval($_POST['insurance_value']));
    }
    
    if (isset($_POST['rental_notes'])) {
        update_post_meta($post_id, '_rental_notes', sanitize_textarea_field($_POST['rental_notes']));
    }
    
    // Maintenance fields
    if (isset($_POST['last_maintenance'])) {
        update_post_meta($post_id, '_last_maintenance', sanitize_text_field($_POST['last_maintenance']));
    }
    
    if (isset($_POST['next_maintenance'])) {
        update_post_meta($post_id, '_next_maintenance', sanitize_text_field($_POST['next_maintenance']));
    }
    
    // Auto-generate title based on brand and model
    if (isset($_POST['equipment_brand']) || isset($_POST['equipment_model'])) {
        $brand = isset($_POST['equipment_brand']) ? sanitize_text_field($_POST['equipment_brand']) : get_post_meta($post_id, '_equipment_brand', true);
        $model = isset($_POST['equipment_model']) ? sanitize_text_field($_POST['equipment_model']) : get_post_meta($post_id, '_equipment_model', true);
        
        if ($brand && $model) {
            $new_title = $brand . ' ' . $model;
        } elseif ($brand) {
            $new_title = $brand;
        } elseif ($model) {
            $new_title = $model;
        } else {
            $new_title = 'Equipment #' . $post_id;
        }
        
        // Remove the save_post action to prevent infinite recursion
        remove_action('save_post', 'save_equipment_meta_data');
        
        // Update the post title
        wp_update_post(array(
            'ID' => $post_id,
            'post_title' => $new_title
        ));
        
        // Re-add the save_post action
        add_action('save_post', 'save_equipment_meta_data');
    }
}
add_action('save_post', 'save_equipment_meta_data');

// Register meta fields for REST API using both methods for better compatibility
function register_equipment_meta_for_rest_api() {
    // Method 1: register_meta with show_in_rest (WordPress 4.7+)
    $meta_fields = array(
        '_equipment_brand' => 'string',
        '_equipment_model' => 'string', 
        '_equipment_menge' => 'integer',
        '_equipment_preis' => 'number',
        '_tagesmiete' => 'number',
        '_wochenendmiete' => 'number',
        '_wochenmiete' => 'number',
        '_monatsmiete' => 'number',
        '_kaution' => 'number',
        '_availability_status' => 'string',
        '_insurance_value' => 'number',
        '_location' => 'string',
        '_rental_notes' => 'string',
        '_last_maintenance' => 'string',
        '_next_maintenance' => 'string'
    );
    
    foreach ($meta_fields as $meta_field => $type) {
        register_meta('post', $meta_field, array(
            'object_subtype' => 'gear',
            'type' => $type,
            'single' => true,
            'show_in_rest' => true,
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            }
        ));
    }
}
add_action('init', 'register_equipment_meta_for_rest_api');

// Method 2: Alternative approach using register_rest_field
function add_equipment_meta_to_rest_api() {
    $meta_fields = array(
        '_equipment_brand',
        '_equipment_model', 
        '_equipment_menge',
        '_equipment_preis',
        '_tagesmiete',
        '_wochenendmiete',
        '_wochenmiete',
        '_monatsmiete',
        '_kaution',
        '_availability_status',
        '_insurance_value',
        '_location',
        '_rental_notes',
        '_last_maintenance',
        '_next_maintenance'
    );

    foreach ($meta_fields as $meta_field) {
        register_rest_field('gear', $meta_field, array(
            'get_callback' => function($object) use ($meta_field) {
                $value = get_post_meta($object['id'], $meta_field, true);
                // Convert numeric fields to proper numbers
                if (in_array($meta_field, ['_equipment_menge', '_equipment_preis', '_tagesmiete', '_wochenendmiete', '_wochenmiete', '_monatsmiete', '_kaution', '_insurance_value'])) {
                    return $value ? (float)$value : 0;
                }
                return $value ?: '';
            },
            'update_callback' => function($value, $object) use ($meta_field) {
                return update_post_meta($object->ID, $meta_field, $value);
            },
            'schema' => array(
                'description' => $meta_field,
                'type' => in_array($meta_field, ['_equipment_menge', '_equipment_preis', '_tagesmiete', '_wochenendmiete', '_wochenmiete', '_monatsmiete', '_kaution', '_insurance_value']) ? 'number' : 'string',
                'context' => array('view', 'edit'),
            ),
        ));
    }
}
add_action('rest_api_init', 'add_equipment_meta_to_rest_api');

// Add custom columns to Equipment admin list
function add_equipment_columns($columns) {
    $columns['equipment_brand'] = 'Marke';
    $columns['equipment_model'] = 'Modell';
    $columns['equipment_menge'] = 'Menge';
    $columns['availability_status'] = 'Status';
    $columns['tagesmiete'] = 'Tagesmiete';
    $columns['wochenendmiete'] = 'Wochenende';
    $columns['equipment_category'] = 'Kategorie';
    return $columns;
}
add_filter('manage_gear_posts_columns', 'add_equipment_columns');

// Populate custom columns
function populate_equipment_columns($column, $post_id) {
    switch ($column) {
        case 'equipment_brand':
            echo esc_html(get_post_meta($post_id, '_equipment_brand', true));
            break;
        case 'equipment_model':
            echo esc_html(get_post_meta($post_id, '_equipment_model', true));
            break;
        case 'equipment_menge':
            $menge = get_post_meta($post_id, '_equipment_menge', true);
            echo $menge ? esc_html($menge) . 'x' : '';
            break;
        case 'availability_status':
            $status = get_post_meta($post_id, '_availability_status', true);
            $status_colors = array(
                'verfügbar' => '#28a745',
                'vermietet' => '#ffc107',
                'wartung' => '#17a2b8',
                'reparatur' => '#dc3545',
                'nicht_verfügbar' => '#6c757d'
            );
            $status_labels = array(
                'verfügbar' => 'Verfügbar',
                'vermietet' => 'Vermietet',
                'wartung' => 'Wartung',
                'reparatur' => 'Reparatur',
                'nicht_verfügbar' => 'Nicht verfügbar'
            );
            if ($status && isset($status_colors[$status])) {
                echo '<span style="color: ' . $status_colors[$status] . '; font-weight: bold;">' . esc_html($status_labels[$status]) . '</span>';
            }
            break;
        case 'tagesmiete':
            $rate = get_post_meta($post_id, '_tagesmiete', true);
            echo $rate ? '€' . number_format($rate, 2) : '';
            break;
        case 'wochenendmiete':
            $rate = get_post_meta($post_id, '_wochenendmiete', true);
            echo $rate ? '€' . number_format($rate, 2) : '';
            break;
        case 'equipment_category':
            $terms = get_the_terms($post_id, 'equipment_category');
            if ($terms && !is_wp_error($terms)) {
                $term_names = array();
                foreach ($terms as $term) {
                    $term_names[] = $term->name;
                }
                echo implode(', ', $term_names);
            }
            break;
    }
}
add_action('manage_gear_posts_custom_column', 'populate_equipment_columns', 10, 2);

// Make custom columns sortable
function make_equipment_columns_sortable($columns) {
    $columns['equipment_brand'] = 'equipment_brand';
    $columns['equipment_model'] = 'equipment_model';
    $columns['equipment_menge'] = 'equipment_menge';
    $columns['availability_status'] = 'availability_status';
    $columns['tagesmiete'] = 'tagesmiete';
    $columns['wochenendmiete'] = 'wochenendmiete';
    return $columns;
}
add_filter('manage_edit-gear_sortable_columns', 'make_equipment_columns_sortable');

// Handle sorting for custom columns
function equipment_columns_orderby($query) {
    if (!is_admin()) {
        return;
    }

    $orderby = $query->get('orderby');

    if ('equipment_brand' == $orderby) {
        $query->set('meta_key', '_equipment_brand');
        $query->set('orderby', 'meta_value');
    } elseif ('equipment_model' == $orderby) {
        $query->set('meta_key', '_equipment_model');
        $query->set('orderby', 'meta_value');
    } elseif ('equipment_menge' == $orderby) {
        $query->set('meta_key', '_equipment_menge');
        $query->set('orderby', 'meta_value_num');
    } elseif ('availability_status' == $orderby) {
        $query->set('meta_key', '_availability_status');
        $query->set('orderby', 'meta_value');
    } elseif ('tagesmiete' == $orderby) {
        $query->set('meta_key', '_tagesmiete');
        $query->set('orderby', 'meta_value_num');
    } elseif ('wochenendmiete' == $orderby) {
        $query->set('meta_key', '_wochenendmiete');
        $query->set('orderby', 'meta_value_num');
    }
}
add_action('pre_get_posts', 'equipment_columns_orderby'); 