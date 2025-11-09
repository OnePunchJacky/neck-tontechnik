=== Neck Tontechnik Revalidate ===
Contributors: neck-tontechnik
Requires at least: 6.1
Tested up to: 6.4
Requires PHP: 7.0
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Triggers Next.js on-demand revalidation when WordPress content is updated.

== Description ==

This plugin automatically triggers Next.js revalidation when WordPress posts, pages, or custom post types are saved, updated, or deleted. This ensures that your Next.js frontend always displays the latest content from WordPress.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/neck-tontechnik-revalidate` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to Settings > Next.js Revalidation
4. Enter your Next.js URL and REVALIDATE_SECRET
5. Make sure REVALIDATE_SECRET matches the environment variable in your Next.js application

== Configuration ==

1. Set the REVALIDATE_SECRET environment variable in your Next.js application
2. Configure the plugin settings in WordPress: Settings > Next.js Revalidation
3. Enter your Next.js base URL (e.g., https://neck-tontechnik.com)
4. Enter the same secret token used in your Next.js REVALIDATE_SECRET environment variable

== How It Works ==

When content is saved in WordPress:
1. The plugin hooks into save_post, delete_post, and transition_post_status actions
2. It makes a POST request to your Next.js /api/revalidate endpoint
3. Next.js validates the secret and revalidates the appropriate pages
4. The pages are regenerated with fresh content on the next request

== Changelog ==

= 1.0.0 =
* Initial release
* Automatic revalidation on post/page save
* Support for custom post types
* Settings page for configuration
* Manual revalidation trigger

