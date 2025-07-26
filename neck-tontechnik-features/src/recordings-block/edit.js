import { useSelect } from '@wordpress/data';

const Edit = () => {
    const posts = useSelect(select =>
        select('core').getEntityRecords('postType', 'recording', { per_page: -1 })
    );

    if (!posts) {
        return <p>RECORDINGS BLOCK</p>;
    }

    return (
        <div>
            <h2>Recordings</h2>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>{post.title.rendered}</li>
                ))}
            </ul>
        </div>
    );
};

export default Edit;
