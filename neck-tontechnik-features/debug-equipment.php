<?php
/**
 * Debug script to check equipment data
 * Add this to a WordPress page or run via WP-CLI
 */

// Only run this in WordPress admin or via WP-CLI
if (!defined('ABSPATH')) {
    exit('This script must be run within WordPress');
}

function debug_equipment_data() {
    echo "<h2>Equipment Debug Information</h2>";
    
    // Check if gear post type exists
    if (post_type_exists('gear')) {
        echo "<p>✅ 'gear' post type is registered</p>";
    } else {
        echo "<p>❌ 'gear' post type is NOT registered</p>";
        return;
    }
    
    // Check if equipment_category taxonomy exists
    if (taxonomy_exists('equipment_category')) {
        echo "<p>✅ 'equipment_category' taxonomy is registered</p>";
    } else {
        echo "<p>❌ 'equipment_category' taxonomy is NOT registered</p>";
    }
    
    // Get all gear posts
    $gear_posts = get_posts(array(
        'post_type' => 'gear',
        'post_status' => array('publish', 'draft'),
        'numberposts' => 10
    ));
    
    echo "<h3>Found " . count($gear_posts) . " gear posts:</h3>";
    
    if (empty($gear_posts)) {
        echo "<p>No equipment found. Please create some equipment in WordPress admin.</p>";
        return;
    }
    
    foreach ($gear_posts as $post) {
        echo "<div style='border: 1px solid #ccc; margin: 10px 0; padding: 10px;'>";
        echo "<h4>Post ID: {$post->ID} - Status: {$post->post_status}</h4>";
        echo "<p><strong>Title:</strong> " . ($post->post_title ?: 'No title') . "</p>";
        echo "<p><strong>Slug:</strong> {$post->post_name}</p>";
        
        // Check meta fields
        $meta_fields = array(
            '_equipment_brand' => 'Brand',
            '_equipment_model' => 'Model',
            '_equipment_menge' => 'Quantity',
            '_tagesmiete' => 'Daily Rate',
            '_wochenendmiete' => 'Weekend Rate',
            '_availability_status' => 'Status'
        );
        
        echo "<h5>Meta Fields:</h5>";
        $has_meta = false;
        foreach ($meta_fields as $meta_key => $label) {
            $value = get_post_meta($post->ID, $meta_key, true);
            if ($value) {
                echo "<p><strong>{$label}:</strong> {$value}</p>";
                $has_meta = true;
            }
        }
        
        if (!$has_meta) {
            echo "<p>❌ No meta fields found</p>";
        }
        
        echo "</div>";
    }
    
    // Test REST API endpoint
    echo "<h3>REST API Test:</h3>";
    echo "<p>Try this URL: <a href='/wp-json/wp/v2/gear' target='_blank'>/wp-json/wp/v2/gear</a></p>";
}

// If accessing directly via browser (for testing)
if (isset($_GET['debug_equipment'])) {
    debug_equipment_data();
}