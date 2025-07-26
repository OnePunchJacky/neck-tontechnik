<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Register Custom Taxonomy for Equipment Categories
function register_equipment_category_taxonomy() {
    $labels = array(
        'name'              => _x('Equipment Categories', 'taxonomy general name', 'text_domain'),
        'singular_name'     => _x('Equipment Category', 'taxonomy singular name', 'text_domain'),
        'search_items'      => __('Search Equipment Categories', 'text_domain'),
        'all_items'         => __('All Equipment Categories', 'text_domain'),
        'parent_item'       => __('Parent Equipment Category', 'text_domain'),
        'parent_item_colon' => __('Parent Equipment Category:', 'text_domain'),
        'edit_item'         => __('Edit Equipment Category', 'text_domain'),
        'update_item'       => __('Update Equipment Category', 'text_domain'),
        'add_new_item'      => __('Add New Equipment Category', 'text_domain'),
        'new_item_name'     => __('New Equipment Category Name', 'text_domain'),
        'menu_name'         => __('Equipment Categories', 'text_domain'),
    );

    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array('slug' => 'equipment-category'),
        'show_in_rest'      => true,
    );

    register_taxonomy('equipment_category', array('gear'), $args);
}
add_action('init', 'register_equipment_category_taxonomy', 0); 