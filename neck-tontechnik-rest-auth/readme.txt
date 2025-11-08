=== Neck Tontechnik REST API Auth ===
Contributors: neck-tontechnik
Requires at least: 6.1
Tested up to: 6.4
Requires PHP: 7.0
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

== Description ==

Custom REST API authentication endpoint that allows regular WordPress passwords (not just application passwords) for REST API authentication.

This plugin adds:
* A custom REST API endpoint at `/wp-json/neck-tontechnik/v1/auth/login` for authentication
* Support for regular WordPress passwords in REST API Basic Auth (in addition to application passwords)

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/neck-tontechnik-rest-auth` directory
2. Activate the plugin through the 'Plugins' menu in WordPress

== Changelog ==

= 1.0.0 =
* Initial release

