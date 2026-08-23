import './SkeletonCard.css';

function SkeletonCard({ className = '' }) {
    return (
        <div className={`skeleton-card ${className}`}>
            <div className="skeleton skeleton-card-media"></div>
            <div className="skeleton-card-body">
                <div className="skeleton skeleton-line" style={{ width: '35%' }}></div>
                <div className="skeleton skeleton-line" style={{ width: '80%' }}></div>
                <div className="skeleton skeleton-line" style={{ width: '55%' }}></div>
            </div>
        </div>
    );
}

export default SkeletonCard;
