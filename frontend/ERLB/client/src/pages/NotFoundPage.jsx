import { Link } from 'react-router-dom';
import SEO from '../components/SEO.jsx';

const NotFoundPage = () => {
  return (
    <section className="section container">
      <SEO title="Page Not Found | ERLB" description="Requested page does not exist." path="/404" />
      <h1>Page not found</h1>
      <p><Link to="/">Go back home</Link></p>
    </section>
  );
};

export default NotFoundPage;
