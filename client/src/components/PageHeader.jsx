import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

function PageHeader({ title, showBack = false }) {
    const navigate = useNavigate();

    return (
        <div className="page-header">
            <h1>{title}</h1>
            {showBack && (
                <a
                    href="#"
                    className="page-header-back"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate(-1);
                    }}
                >
                    ← Voltar
                </a>
            )}
        </div>
    );
}

export default PageHeader;
