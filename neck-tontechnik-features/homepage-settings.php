<?php

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Register homepage settings meta fields for REST API
 * This allows the Next.js frontend to read/write homepage configuration
 * like logos, hero images, and testimonials via WordPress REST API
 */
function register_homepage_settings_meta_for_rest_api() {
    // Register meta fields for standard posts (used for settings post)
    $meta_fields = array(
        'homepage_logos',
        'homepage_hero_config', // Note: matches the field name used in Next.js
        'homepage_testimonials',
    );
    
    foreach ($meta_fields as $meta_field) {
        register_meta('post', $meta_field, array(
            'type' => 'string', // WordPress will serialize arrays automatically
            'single' => true,
            'show_in_rest' => true, // Enable REST API access
            'auth_callback' => function() {
                return current_user_can('edit_posts');
            },
            'sanitize_callback' => function($value) use ($meta_field) {
                // Allow arrays and objects - WordPress will serialize them automatically
                if (is_array($value) || is_object($value)) {
                    // WordPress will handle serialization, just return as-is
                    return $value;
                }
                // For strings, sanitize normally
                return sanitize_textarea_field($value);
            },
        ));
    }
}
add_action('init', 'register_homepage_settings_meta_for_rest_api');

