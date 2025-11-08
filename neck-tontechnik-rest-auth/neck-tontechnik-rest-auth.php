<?php
/**
 * Plugin Name:       Neck Tontechnik REST API Auth
 * Description:       Custom REST API authentication endpoint that allows regular WordPress passwords (not just application passwords)
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            Neck Tontechnik
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       neck-tontechnik-rest-auth
 *
 * @package           neck-tontechnik-rest-auth
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Register custom authentication endpoint
 */
function neck_tontechnik_register_auth_endpoint() {
    register_rest_route('neck-tontechnik/v1', '/auth/login', array(
        'methods' => 'POST',
        'callback' => 'neck_tontechnik_handle_auth_login',
        'permission_callback' => '__return_true', // Public endpoint
        'args' => array(
            'username' => array(
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'password' => array(
                'required' => true,
                'type' => 'string',
            ),
        ),
    ));
}
add_action('rest_api_init', 'neck_tontechnik_register_auth_endpoint');

/**
 * Allow regular passwords for REST API Basic Auth
 * This modifies WordPress's REST API authentication to accept regular passwords
 */
function neck_tontechnik_allow_regular_passwords($result) {
    // If there's already an authenticated user or error, return as-is
    if (!empty($result) || is_wp_error($result)) {
        return $result;
    }

    // Check for Basic Auth
    if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
        return $result;
    }

    $username = $_SERVER['PHP_AUTH_USER'];
    $password = $_SERVER['PHP_AUTH_PW'];

    // Try to authenticate with regular password
    $user = wp_authenticate($username, $password);

    if (!is_wp_error($user)) {
        // Check if user has edit capabilities
        if (user_can($user, 'edit_posts') || user_can($user, 'edit_pages') || user_can($user, 'administrator')) {
            return $user->ID;
        }
    }

    return $result;
}
// Hook into REST API authentication
// Priority 20 to run after application password check but before default
add_filter('determine_current_user', 'neck_tontechnik_allow_regular_passwords', 20);

/**
 * Handle custom authentication login
 */
function neck_tontechnik_handle_auth_login($request) {
    $username = $request->get_param('username');
    $password = $request->get_param('password');

    if (empty($username) || empty($password)) {
        return new WP_Error(
            'missing_credentials',
            'Benutzername und Passwort sind erforderlich.',
            array('status' => 400)
        );
    }

    // Authenticate user with WordPress
    $user = wp_authenticate($username, $password);

    if (is_wp_error($user)) {
        return new WP_Error(
            'invalid_credentials',
            'Ungültige Anmeldedaten.',
            array('status' => 401)
        );
    }

    // Check if user has edit capabilities
    if (!user_can($user, 'edit_posts') && !user_can($user, 'edit_pages') && !user_can($user, 'administrator')) {
        return new WP_Error(
            'insufficient_permissions',
            'Keine Berechtigung zum Zugriff auf das Admin-Panel.',
            array('status' => 403)
        );
    }

    // Generate a token for Basic Auth (username:password base64 encoded)
    $token = base64_encode($username . ':' . $password);

    // Return user data and token
    return array(
        'success' => true,
        'user' => array(
            'id' => $user->ID,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'roles' => $user->roles,
            'capabilities' => $user->allcaps,
        ),
        'token' => $token,
    );
}

