<?php
/**
 * Plugin Name:       Neck Tontechnik Revalidate
 * Description:       Triggers Next.js revalidation when WordPress content is updated
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            Neck Tontechnik
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       neck-tontechnik-revalidate
 *
 * @package           neck-tontechnik-revalidate
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * Get the Next.js revalidation URL
 */
function neck_tontechnik_get_revalidate_url() {
    $nextjs_url = get_option('neck_tontechnik_nextjs_url', 'https://neck-tontechnik.com');
    $secret = get_option('neck_tontechnik_revalidate_secret', '');
    
    if (empty($secret)) {
        error_log('Neck Tontechnik Revalidate: REVALIDATE_SECRET is not set in WordPress options');
        return null;
    }
    
    return $nextjs_url . '/api/revalidate?secret=' . urlencode($secret);
}

/**
 * Trigger Next.js revalidation
 */
function neck_tontechnik_trigger_revalidate($postType = null, $postId = null) {
    $url = neck_tontechnik_get_revalidate_url();
    
    if (!$url) {
        return false;
    }
    
    // Prepare request body
    $body = array(
        'secret' => get_option('neck_tontechnik_revalidate_secret', ''),
    );
    
    if ($postType) {
        $body['postType'] = $postType;
    }
    
    if ($postId) {
        $body['postId'] = $postId;
    }
    
    // Make POST request to Next.js API
    $response = wp_remote_post($url, array(
        'method' => 'POST',
        'timeout' => 10,
        'headers' => array(
            'Content-Type' => 'application/json',
        ),
        'body' => json_encode($body),
    ));
    
    if (is_wp_error($response)) {
        error_log('Neck Tontechnik Revalidate Error: ' . $response->get_error_message());
        return false;
    }
    
    $status_code = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    
    if ($status_code === 200) {
        error_log('Neck Tontechnik Revalidate: Successfully triggered revalidation for ' . ($postType ?: 'all pages'));
        return true;
    } else {
        error_log('Neck Tontechnik Revalidate: Failed with status ' . $status_code . ' - ' . $body);
        return false;
    }
}

/**
 * Hook into post/page save actions
 */
function neck_tontechnik_revalidate_on_save($post_id, $post, $update) {
    // Don't revalidate on autosave, revision, or trash
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
        return;
    }
    
    if ($post->post_status === 'trash') {
        return;
    }
    
    // Only revalidate published posts
    if ($post->post_status !== 'publish') {
        return;
    }
    
    // Get post type
    $post_type = $post->post_type;
    
    // Trigger revalidation
    neck_tontechnik_trigger_revalidate($post_type, $post_id);
}
add_action('save_post', 'neck_tontechnik_revalidate_on_save', 10, 3);

/**
 * Revalidate when post is deleted
 */
function neck_tontechnik_revalidate_on_delete($post_id) {
    $post = get_post($post_id);
    if ($post) {
        neck_tontechnik_trigger_revalidate($post->post_type, $post_id);
    }
}
add_action('delete_post', 'neck_tontechnik_revalidate_on_delete', 10, 1);

/**
 * Revalidate when post status changes (e.g., published, unpublished)
 */
function neck_tontechnik_revalidate_on_status_change($new_status, $old_status, $post) {
    if ($new_status === 'publish' || $old_status === 'publish') {
        neck_tontechnik_trigger_revalidate($post->post_type, $post->ID);
    }
}
add_action('transition_post_status', 'neck_tontechnik_revalidate_on_status_change', 10, 3);

/**
 * Add settings page
 */
function neck_tontechnik_revalidate_add_settings_page() {
    add_options_page(
        'Next.js Revalidation',
        'Next.js Revalidation',
        'manage_options',
        'neck-tontechnik-revalidate',
        'neck_tontechnik_revalidate_settings_page'
    );
}
add_action('admin_menu', 'neck_tontechnik_revalidate_add_settings_page');

/**
 * Settings page content
 */
function neck_tontechnik_revalidate_settings_page() {
    if (isset($_POST['neck_tontechnik_revalidate_save'])) {
        check_admin_referer('neck_tontechnik_revalidate_settings');
        
        $nextjs_url = sanitize_text_field($_POST['neck_tontechnik_nextjs_url']);
        $secret = sanitize_text_field($_POST['neck_tontechnik_revalidate_secret']);
        
        update_option('neck_tontechnik_nextjs_url', $nextjs_url);
        update_option('neck_tontechnik_revalidate_secret', $secret);
        
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    $nextjs_url = get_option('neck_tontechnik_nextjs_url', 'https://neck-tontechnik.com');
    $secret = get_option('neck_tontechnik_revalidate_secret', '');
    ?>
    <div class="wrap">
        <h1>Next.js Revalidation Settings</h1>
        <form method="post" action="">
            <?php wp_nonce_field('neck_tontechnik_revalidate_settings'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="neck_tontechnik_nextjs_url">Next.js URL</label>
                    </th>
                    <td>
                        <input 
                            type="url" 
                            id="neck_tontechnik_nextjs_url" 
                            name="neck_tontechnik_nextjs_url" 
                            value="<?php echo esc_attr($nextjs_url); ?>" 
                            class="regular-text"
                            placeholder="https://neck-tontechnik.com"
                        />
                        <p class="description">The base URL of your Next.js application</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="neck_tontechnik_revalidate_secret">Revalidation Secret</label>
                    </th>
                    <td>
                        <input 
                            type="text" 
                            id="neck_tontechnik_revalidate_secret" 
                            name="neck_tontechnik_revalidate_secret" 
                            value="<?php echo esc_attr($secret); ?>" 
                            class="regular-text"
                            placeholder="your-secret-token"
                        />
                        <p class="description">Must match the REVALIDATE_SECRET environment variable in your Next.js app</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Settings', 'primary', 'neck_tontechnik_revalidate_save'); ?>
        </form>
        
        <h2>Test Revalidation</h2>
        <p>Click the button below to manually trigger a revalidation of all common pages:</p>
        <form method="post" action="">
            <?php wp_nonce_field('neck_tontechnik_revalidate_test'); ?>
            <input type="hidden" name="neck_tontechnik_revalidate_test" value="1" />
            <?php submit_button('Trigger Revalidation', 'secondary', 'test_revalidate'); ?>
        </form>
        
        <?php
        if (isset($_POST['neck_tontechnik_revalidate_test'])) {
            check_admin_referer('neck_tontechnik_revalidate_test');
            $result = neck_tontechnik_trigger_revalidate();
            if ($result) {
                echo '<div class="notice notice-success"><p>Revalidation triggered successfully!</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>Revalidation failed. Check your settings and server logs.</p></div>';
            }
        }
        ?>
    </div>
    <?php
}

/**
 * Register settings
 */
function neck_tontechnik_revalidate_register_settings() {
    register_setting('neck_tontechnik_revalidate', 'neck_tontechnik_nextjs_url');
    register_setting('neck_tontechnik_revalidate', 'neck_tontechnik_revalidate_secret');
}
add_action('admin_init', 'neck_tontechnik_revalidate_register_settings');

