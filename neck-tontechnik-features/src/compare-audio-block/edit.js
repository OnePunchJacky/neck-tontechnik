import { useSelect } from '@wordpress/data';
import AudioPlayer from './audio-player'; // Make sure to create this component

const Edit = () => {
    const posts = useSelect(select =>
        select('core').getEntityRecords('postType', 'audio_sample', { per_page: -1 })
    );

    if (!posts) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {posts.map(post => (
                <div key={post.id}>
                    <AudioPlayer post={post} />
                </div>
            ))}
        </div>
    );
};

export default Edit;
