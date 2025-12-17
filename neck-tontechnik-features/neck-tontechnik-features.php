<?php
/**
 * Plugin Name:       Neck Tontechnik Features
 * Description:       Contains all added features for this Website
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       neck-tontechnik-features
 *
 * @package           create-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// include blocks from custom-blocks.php
require_once plugin_dir_path( __FILE__ ) . 'custom-blocks.php';

// include custom post types from custom-post-types.php
require_once plugin_dir_path( __FILE__ ) . 'custom-post-types.php';

// include rental system
require_once plugin_dir_path( __FILE__ ) . 'rental-system.php';

// include homepage settings support
require_once plugin_dir_path( __FILE__ ) . 'homepage-settings.php';

// add font aweseome icons
/**
 * Font Awesome Kit Setup
 *
 * This will add your Font Awesome Kit to the front-end, the admin back-end,
 * and the login screen area.
 */
if (! function_exists('fa_custom_setup_kit') ) {
	function fa_custom_setup_kit($kit_url = '') {
	  foreach ( [ 'wp_enqueue_scripts', 'admin_enqueue_scripts', 'login_enqueue_scripts' ] as $action ) {
		add_action(
		  $action,
		  function () use ( $kit_url ) {
			wp_enqueue_script( 'font-awesome-kit', $kit_url, [], null );
		  }
		);
	  }
	}
  }

  
fa_custom_setup_kit('https://kit.fontawesome.com/c9def3363d.js');

