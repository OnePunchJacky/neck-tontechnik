<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Register Custom Post Type for Equipment Units (Individual Items)
function register_equipment_units_post_type() {
    $labels = array(
        'name'                  => _x('Equipment Units', 'Post Type General Name', 'text_domain'),
        'singular_name'         => _x('Equipment Unit', 'Post Type Singular Name', 'text_domain'),
        'add_new_item'          => __('Add Equipment Unit', 'text_domain'),
        'add_new'               => __('Add Unit', 'text_domain'),
        'edit_item'             => __('Edit Equipment Unit', 'text_domain'),
        'new_item'              => __('New Equipment Unit', 'text_domain'),
        'view_item'             => __('View Equipment Unit', 'text_domain'),
        'search_items'          => __('Search Equipment Units', 'text_domain'),
        'not_found'             => __('No equipment units found', 'text_domain'),
        'not_found_in_trash'    => __('No equipment units found in trash', 'text_domain'),
    );
    
    $args = array(
        'label'                 => __('Equipment Unit', 'text_domain'),
        'labels'                => $labels,
        'supports'              => array('custom-fields'),
        'hierarchical'          => false,
        'public'                => false,
        'show_ui'               => true,
        'show_in_menu'          => 'edit.php?post_type=gear',
        'menu_position'         => 9,
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => false,
        'can_export'            => true,
        'has_archive'           => false,
        'exclude_from_search'   => true,
        'publicly_queryable'    => false,
        'capability_type'       => 'post',
        'show_in_rest'          => false,
    );
    
    register_post_type('equipment_unit', $args);
}
add_action('init', 'register_equipment_units_post_type', 0);

// Add meta box for Equipment Units
function add_equipment_unit_meta_boxes() {
    add_meta_box(
        'equipment_unit_details',
        'Unit Details',
        'equipment_unit_details_callback',
        'equipment_unit',
        'normal',
        'default'
    );
}
add_action('add_meta_boxes', 'add_equipment_unit_meta_boxes');

// Meta Box Callback for Equipment Units
function equipment_unit_details_callback($post) {
    wp_nonce_field(basename(__FILE__), 'equipment_unit_nonce');
    
    // Get current values
    $parent_equipment = get_post_meta($post->ID, '_parent_equipment', true);
    $unit_serial = get_post_meta($post->ID, '_unit_serial', true);
    $unit_condition = get_post_meta($post->ID, '_unit_condition', true);
    $unit_status = get_post_meta($post->ID, '_unit_status', true);
    $current_renter = get_post_meta($post->ID, '_current_renter', true);
    $rental_start = get_post_meta($post->ID, '_rental_start', true);
    $rental_end = get_post_meta($post->ID, '_rental_end', true);
    $unit_notes = get_post_meta($post->ID, '_unit_notes', true);
    $unit_purchase_date = get_post_meta($post->ID, '_unit_purchase_date', true);
    $last_maintenance = get_post_meta($post->ID, '_unit_last_maintenance', true);
    $next_maintenance = get_post_meta($post->ID, '_unit_next_maintenance', true);
    
    // Get equipment options
    $equipment_posts = get_posts(array(
        'post_type' => 'gear',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    ));
    
    ?>
    <style>
    /* Hide title field for Equipment Units */
    .post-type-equipment_unit #titlediv {
        display: none !important;
    }
    </style>
    
    <table class="form-table">
        <tr>
            <th><label for="parent_equipment">Equipment Type</label></th>
            <td>
                <select id="parent_equipment" name="parent_equipment" required>
                    <option value="">Select Equipment Type</option>
                    <?php foreach ($equipment_posts as $equipment): ?>
                        <option value="<?php echo $equipment->ID; ?>" <?php selected($parent_equipment, $equipment->ID); ?>>
                            <?php echo esc_html($equipment->post_title); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </td>
        </tr>
        <tr>
            <th><label for="unit_serial">Serial Number</label></th>
            <td><input type="text" id="unit_serial" name="unit_serial" value="<?php echo esc_attr($unit_serial); ?>" size="30" /></td>
        </tr>
        <tr>
            <th><label for="unit_purchase_date">Purchase Date</label></th>
            <td><input type="date" id="unit_purchase_date" name="unit_purchase_date" value="<?php echo esc_attr($unit_purchase_date); ?>" /></td>
        </tr>
        <tr>
            <th><label for="unit_condition">Condition</label></th>
            <td>
                <select id="unit_condition" name="unit_condition">
                    <option value="">Select Condition</option>
                    <option value="neu" <?php selected($unit_condition, 'neu'); ?>>Neu</option>
                    <option value="sehr_gut" <?php selected($unit_condition, 'sehr_gut'); ?>>Sehr gut</option>
                    <option value="gut" <?php selected($unit_condition, 'gut'); ?>>Gut</option>
                    <option value="zufriedenstellend" <?php selected($unit_condition, 'zufriedenstellend'); ?>>Zufriedenstellend</option>
                    <option value="reparatur_noetig" <?php selected($unit_condition, 'reparatur_noetig'); ?>>Reparatur nötig</option>
                </select>
            </td>
        </tr>
        <tr>
            <th><label for="unit_status">Status</label></th>
            <td>
                <select id="unit_status" name="unit_status">
                    <option value="verfügbar" <?php selected($unit_status, 'verfügbar'); ?>>Verfügbar</option>
                    <option value="vermietet" <?php selected($unit_status, 'vermietet'); ?>>Vermietet</option>
                    <option value="wartung" <?php selected($unit_status, 'wartung'); ?>>In Wartung</option>
                    <option value="reparatur" <?php selected($unit_status, 'reparatur'); ?>>In Reparatur</option>
                    <option value="nicht_verfügbar" <?php selected($unit_status, 'nicht_verfügbar'); ?>>Nicht verfügbar</option>
                </select>
            </td>
        </tr>
    </table>
    
    <h3>Rental Information</h3>
    <table class="form-table">
        <tr>
            <th><label for="current_renter">Current Renter</label></th>
            <td><input type="text" id="current_renter" name="current_renter" value="<?php echo esc_attr($current_renter); ?>" size="50" /></td>
        </tr>
        <tr>
            <th><label for="rental_start">Rental Start Date</label></th>
            <td><input type="date" id="rental_start" name="rental_start" value="<?php echo esc_attr($rental_start); ?>" /></td>
        </tr>
        <tr>
            <th><label for="rental_end">Rental End Date</label></th>
            <td><input type="date" id="rental_end" name="rental_end" value="<?php echo esc_attr($rental_end); ?>" /></td>
        </tr>
    </table>
    
    <h3>Maintenance</h3>
    <table class="form-table">
        <tr>
            <th><label for="unit_last_maintenance">Last Maintenance</label></th>
            <td><input type="date" id="unit_last_maintenance" name="unit_last_maintenance" value="<?php echo esc_attr($last_maintenance); ?>" /></td>
        </tr>
        <tr>
            <th><label for="unit_next_maintenance">Next Maintenance</label></th>
            <td><input type="date" id="unit_next_maintenance" name="unit_next_maintenance" value="<?php echo esc_attr($next_maintenance); ?>" /></td>
        </tr>
        <tr>
            <th><label for="unit_notes">Notes</label></th>
            <td><textarea id="unit_notes" name="unit_notes" rows="4" cols="50"><?php echo esc_textarea($unit_notes); ?></textarea></td>
        </tr>
    </table>
    <?php
}

// Save Equipment Unit meta data
function save_equipment_unit_meta_data($post_id) {
    if (!isset($_POST['equipment_unit_nonce']) || !wp_verify_nonce($_POST['equipment_unit_nonce'], basename(__FILE__))) {
        return $post_id;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return $post_id;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return $post_id;
    }

    // Save all fields
    $fields = array(
        'parent_equipment', 'unit_serial', 'unit_purchase_date', 'unit_condition', 'unit_status',
        'current_renter', 'rental_start', 'rental_end', 'unit_notes',
        'unit_last_maintenance', 'unit_next_maintenance'
    );

    foreach ($fields as $field) {
        if (isset($_POST[$field])) {
            if (in_array($field, array('unit_notes'))) {
                update_post_meta($post_id, '_' . $field, sanitize_textarea_field($_POST[$field]));
            } else {
                update_post_meta($post_id, '_' . $field, sanitize_text_field($_POST[$field]));
            }
        }
    }
    
    // Auto-generate title based on equipment type and serial number
    if (isset($_POST['parent_equipment']) && $_POST['parent_equipment']) {
        $parent_title = get_the_title($_POST['parent_equipment']);
        $serial = isset($_POST['unit_serial']) ? sanitize_text_field($_POST['unit_serial']) : '';
        
        if ($serial) {
            $new_title = $parent_title . ' - ' . $serial;
        } else {
            $new_title = $parent_title . ' - Unit #' . $post_id;
        }
        
        // Remove the save_post action to prevent infinite recursion
        remove_action('save_post', 'save_equipment_unit_meta_data');
        
        // Update the post title
        wp_update_post(array(
            'ID' => $post_id,
            'post_title' => $new_title
        ));
        
        // Re-add the save_post action
        add_action('save_post', 'save_equipment_unit_meta_data');
    }
}
add_action('save_post', 'save_equipment_unit_meta_data');

// Add custom columns for Equipment Units
function add_equipment_unit_columns($columns) {
    $columns['parent_equipment'] = 'Equipment Type';
    $columns['unit_serial'] = 'Serial Number';
    $columns['unit_condition'] = 'Condition';
    $columns['unit_status'] = 'Status';
    $columns['current_renter'] = 'Current Renter';
    $columns['rental_period'] = 'Rental Period';
    return $columns;
}
add_filter('manage_equipment_unit_posts_columns', 'add_equipment_unit_columns');

// Populate Equipment Unit columns
function populate_equipment_unit_columns($column, $post_id) {
    switch ($column) {
        case 'parent_equipment':
            $parent_id = get_post_meta($post_id, '_parent_equipment', true);
            if ($parent_id) {
                $parent_title = get_the_title($parent_id);
                echo '<a href="' . get_edit_post_link($parent_id) . '">' . esc_html($parent_title) . '</a>';
            }
            break;
        case 'unit_serial':
            echo esc_html(get_post_meta($post_id, '_unit_serial', true));
            break;
        case 'unit_condition':
            $condition = get_post_meta($post_id, '_unit_condition', true);
            $condition_labels = array(
                'neu' => 'Neu',
                'sehr_gut' => 'Sehr gut',
                'gut' => 'Gut',
                'zufriedenstellend' => 'Zufriedenstellend',
                'reparatur_noetig' => 'Reparatur nötig'
            );
            echo isset($condition_labels[$condition]) ? esc_html($condition_labels[$condition]) : '';
            break;
        case 'unit_status':
            $status = get_post_meta($post_id, '_unit_status', true);
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
        case 'current_renter':
            echo esc_html(get_post_meta($post_id, '_current_renter', true));
            break;
        case 'rental_period':
            $start = get_post_meta($post_id, '_rental_start', true);
            $end = get_post_meta($post_id, '_rental_end', true);
            if ($start && $end) {
                echo esc_html($start) . ' - ' . esc_html($end);
            } elseif ($start) {
                echo 'From: ' . esc_html($start);
            }
            break;
    }
}
add_action('manage_equipment_unit_posts_custom_column', 'populate_equipment_unit_columns', 10, 2);

// Add Units section to main Equipment edit page
function add_equipment_units_meta_box() {
    add_meta_box(
        'equipment_units_list',
        'Individual Units',
        'equipment_units_list_callback',
        'gear',
        'normal',
        'default'
    );
}
add_action('add_meta_boxes', 'add_equipment_units_meta_box');

// Display units list in main equipment page
function equipment_units_list_callback($post) {
    $units = get_posts(array(
        'post_type' => 'equipment_unit',
        'posts_per_page' => -1,
        'meta_query' => array(
            array(
                'key' => '_parent_equipment',
                'value' => $post->ID,
                'compare' => '='
            )
        )
    ));
    
    ?>
    <div style="margin-bottom: 15px;">
        <a href="<?php echo admin_url('post-new.php?post_type=equipment_unit&parent=' . $post->ID); ?>" class="button button-primary">Add New Unit</a>
    </div>
    
    <?php if ($units): ?>
        <table class="widefat fixed striped">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Serial Number</th>
                    <th>Condition</th>
                    <th>Status</th>
                    <th>Current Renter</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($units as $unit): ?>
                <tr>
                    <td><strong><?php echo esc_html($unit->post_title); ?></strong></td>
                    <td><?php echo esc_html(get_post_meta($unit->ID, '_unit_serial', true)); ?></td>
                    <td>
                        <?php 
                        $condition = get_post_meta($unit->ID, '_unit_condition', true);
                        $condition_labels = array(
                            'neu' => 'Neu',
                            'sehr_gut' => 'Sehr gut',
                            'gut' => 'Gut',
                            'zufriedenstellend' => 'Zufriedenstellend',
                            'reparatur_noetig' => 'Reparatur nötig'
                        );
                        echo isset($condition_labels[$condition]) ? esc_html($condition_labels[$condition]) : '';
                        ?>
                    </td>
                    <td>
                        <?php 
                        $status = get_post_meta($unit->ID, '_unit_status', true);
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
                        ?>
                    </td>
                    <td><?php echo esc_html(get_post_meta($unit->ID, '_current_renter', true)); ?></td>
                    <td>
                        <a href="<?php echo get_edit_post_link($unit->ID); ?>" class="button button-small">Edit</a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    <?php else: ?>
        <p>No individual units created yet. <a href="<?php echo admin_url('post-new.php?post_type=equipment_unit&parent=' . $post->ID); ?>">Create the first unit</a>.</p>
    <?php endif; ?>
    
    <script>
    // Auto-fill parent equipment when coming from main equipment page
    jQuery(document).ready(function($) {
        var urlParams = new URLSearchParams(window.location.search);
        var parentId = urlParams.get('parent');
        if (parentId) {
            $('#parent_equipment').val(parentId);
        }
    });
    </script>
    <?php
} 