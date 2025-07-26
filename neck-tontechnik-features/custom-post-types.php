<?php

/** POST TYPES */

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Include organized files
require_once plugin_dir_path(__FILE__) . 'equipment-taxonomies.php';
require_once plugin_dir_path(__FILE__) . 'equipment-post-type.php';
require_once plugin_dir_path(__FILE__) . 'equipment-units-post-type.php';

// Register Custom Post Type for Artists
function register_artist_post_type()
{
    $labels = array(
        'name'                  => _x('Artists', 'Post Type General Name', 'text_domain'),
        'singular_name'         => _x('Artist', 'Post Type Singular Name', 'text_domain'),
        'add_new_item'          => __('Add New Artist', 'text_domain'),
        'add_new'          => __('Add Artist', 'text_domain'),

    );
    $args = array(
        'label'                 => __('Artist', 'text_domain'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 5,
        'menu_icon'             => 'dashicons-id',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true,
        'taxonomies'            => array('category'), // Add this line
    );
    register_post_type('artist', $args);
}
add_action('init', 'register_artist_post_type', 0);

// Register Custom Post Type for Live References
function register_live_references_post_type()
{
    $labels = array(
        'name'                  => _x('Live References', 'Post Type General Name', 'text_domain'),
        'singular_name'         => _x('Live Reference', 'Post Type Singular Name', 'text_domain'),
        'add_new_item'          => __('Add New Reference', 'text_domain'),
        'add_new'          => __('Add Reference', 'text_domain'),

    );
    $args = array(
        'label'                 => __('Live Reference', 'text_domain'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 6,
        'menu_icon'             => 'dashicons-microphone', // Icon for live references
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true, // Enable Gutenberg editor if you want
    );
    register_post_type('live_reference', $args);
}
add_action('init', 'register_live_references_post_type', 0);

// Register Custom Post Type for Audio Samples
function register_audio_samples_post_type()
{
    $labels = array(
        'name'                  => _x('Audio Samples', 'Post Type General Name', 'text_domain'),
        'singular_name'         => _x('Audio Sample', 'Post Type Singular Name', 'text_domain'),
        'add_new_item'          => __('Add Audio Sample', 'text_domain'),
        'add_new'          => __('Add Audio Sample', 'text_domain'),
    );
    $args = array(
        'label'                 => __('Audio Sample', 'text_domain'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 7,
        'menu_icon'             => 'dashicons-format-audio', // Icon for audio samples
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true, // Enable Gutenberg editor if you want
        'taxonomies'            => array('category'), // Add category support
    );
    register_post_type('audio_sample', $args);
}
add_action('init', 'register_audio_samples_post_type', 0);

function register_recordings_post_type()
{
    $labels = array(
        'name'                  => _x('Recordings', 'Post Type General Name', 'text_domain'),
        'singular_name'         => _x('Recording', 'Post Type Singular Name', 'text_domain'),
        'add_new_item'          => __('Add Recording', 'text_domain'),
        'add_new'          => __('Add Recording', 'text_domain'),
    );
    $args = array(
        'label'                 => __('Recording', 'text_domain'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'custom-fields'),
        'hierarchical'          => false,
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 8,
        'menu_icon'             => 'dashicons-album', // Icon for audio samples
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => true,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'capability_type'       => 'post',
        'show_in_rest'          => true, // Enable Gutenberg editor if you want
        'taxonomies'            => array('category'), // Add category support
    );
    register_post_type('recording', $args);
}

add_action('init', 'register_recordings_post_type', 0);



