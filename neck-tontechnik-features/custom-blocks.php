<?php


/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */

if (!defined('ABSPATH')) {
    exit;
}

function compare_audio_block_compare_audio_block_block_init()
{
    register_block_type(
        __DIR__ . '/build/compare-audio-block',
        array(
            'render_callback' => function () {

                $audio_samples = get_posts(
                    array(
                        'post_type' => 'audio_sample',
                        'numberposts' => -1 // Get all posts
                    )
                );

                if (empty($audio_samples)) {
                    return 'No audio samples found.';
                }

                $output = '<div class="audio-samples-block">';
                foreach ($audio_samples as $post) {
                    // Fetch ACF fields for each post
                    $sample_1_url = get_field('sample_1', $post->ID);
                    $sample_2_url = get_field('sample_2', $post->ID);

                    $output .= '<div class="audio-sample">';
                    $output .= '<h2>' . esc_html(get_the_title($post->ID)) . '</h2>';

                    // Add audio elements if URLs are available
                    if ($sample_1_url) {

                        $output .= '<p>Vorher</p> <audio controls src="' . esc_url($sample_1_url) . '"></audio>';
                    }
                    if ($sample_2_url) {

                        $output .= '<p>Nachher</p> <audio controls src="' . esc_url($sample_2_url) . '"></audio>';
                    }

                    $output .= '</div>';
                }
                $output .= '</div>';

                return $output;
            }
        )
    );
}
add_action('init', 'compare_audio_block_compare_audio_block_block_init');

function recordings_block_init()
{
    register_block_type(
        __DIR__ . '/build/recordings-block',
        array(
            'render_callback' => function () {

                $recordings = get_posts(
                    array(
                        'post_type' => 'recording',
                        'numberposts' => -1 // Get all posts
                    )
                );

                if (empty($recordings)) {
                    return 'No records samples found.';
                }

                //display recordings variable for testing
        
                $output = '<div style="width: 100%; display: flex; flex-wrap: wrap; gap: 20px;" class="recordings-grid">';
                foreach ($recordings as $post) {
                    // Fetch ACF fields for each post
                    $cover = get_the_post_thumbnail_url($post->ID, 'full');
					$cover = get_field('cover' , $post->ID);


                    $spotify_url = get_field('spotify', $post->ID);
					$soundcloud_url = get_field('soundcloud', $post->ID);
                    $bandcamp_url = get_field('bandcamp', $post->ID);
                    $youtube_url = get_field('youtube', $post->ID);
                    $artist_post = get_field('artist', $post->ID);
                    $categories_array = get_the_category($post->ID);
                    $spotify_album_id = get_field('spotify_album_id', $post->ID);

                    $spotify_api_url = 'https://accounts.spotify.com/api/token';
                    $spotify_api_data = array(
                        'grant_type' => 'client_credentials',
                        'client_id' => 'a608bcb78d50405b83d9b93075e808ba',
                        'client_secret' => '5b70bef386344813b08482470bb23dfd'
                    );

                    $spotify_api_response = wp_remote_post($spotify_api_url, array(
                        'body' => $spotify_api_data
                    ));

                    if (!is_wp_error($spotify_api_response) && wp_remote_retrieve_response_code($spotify_api_response) === 200) {
                        $spotify_api_data = json_decode(wp_remote_retrieve_body($spotify_api_response), true);
                        $access_token = $spotify_api_data['access_token'];

                        // Continue with the rest of the code
                    }


                    if ($spotify_album_id) {
                        $spotify_api_url = 'https://api.spotify.com/v1/albums/' . $spotify_album_id;
                        $spotify_api_url .= '?access_token=' . $access_token . '&market=DE'; 
                        
                       

                        $spotify_api_response = wp_remote_get($spotify_api_url);

                        if (!is_wp_error($spotify_api_response) && wp_remote_retrieve_response_code($spotify_api_response) === 200) {
                            $spotify_api_data = json_decode(wp_remote_retrieve_body($spotify_api_response), true);

                            if (isset($spotify_api_data['images'][0]['url'])) {
                                $cover = $spotify_api_data['images'][0]['url'];
                            }
                        }
                    }

                    if (!empty($artist_post)) {
                        $artist_titles = array();
                        foreach ($artist_post as $artist) {
                            $artist_titles[] = $artist->post_title;
                        }
                        $artist_title = implode(', ', $artist_titles);
                    } else {
                        $artist_title = '';
                    }

                    $output .= '<div class="recording" style="width: 300px; padding: 20px; box-sizing: border-box; box-shadow: 0 0px 10px rgba(0, 0, 0, 0.2); border-radius: 10px;">';


                    if ($cover) {
                        $output .= '<div style="width: 100%; padding-bottom: 100%; background-size: cover; box-sizing: border-box; background-image: url(' . $cover . ')"></div>';
                    } else {
                        $output .= '<div style="width: 100%; padding-bottom: 100%; background-size: cover ;box-sizing: border-box; color: white; background-color: black;"></div>';
                    }

                    $output .= '<span style=" display: block; margin-top: 10px;">' . $artist_title . ' - ' . esc_html(get_the_title($post->ID)) . '</span>';

                    if ($categories_array) {
                        $output .= '<div>';
                        $categories = array();

                        foreach ($categories_array as $category) {
                            $categories[] = $category->name;
                        }
                        $categories_names = implode(', ', $categories);
                        $output .= '<small>' . $categories_names . '</small>';
                        $output .= '</div>';
                    }




                    if ($spotify_url || $bandcamp_url || $youtube_url || $soundcloud_url) {

                        $output .= '<div class="buttons" style="display:flex; gap: 10px; ">';

                        if ($spotify_url) {
                            $output .= '<a style="font-size: 2em;" href="' . $spotify_url . '" target="_blank" class="button"><i class="fa-brands fa-spotify"></i></a>';
                        }
                        if ($bandcamp_url) {
                            $output .= '<a style="font-size: 2em;" href="' . $bandcamp_url . '" target="_blank" class="button"><i class="fa-brands fa-bandcamp"></i></a>';
                        }
                        if ($youtube_url) {
                            $output .= '<a style="font-size: 2em;" href="' . $youtube_url . '" target="_blank" class="button"><i class="fa-brands fa-youtube"></i></a>';
                        }
						if ($soundcloud_url) {
                            $output .= '<a style="font-size: 2em;" href="' . $soundcloud_url . '" target="_blank" class="button"><i class="fa-brands fa-soundcloud"></i></a>';
                        }

                        $output .= '</div>';
                    }
                    $output .= '</div>';
                }
                $output .= '</div>';


                return $output;
            }
        )
    );
}
add_action('init', 'recordings_block_init');