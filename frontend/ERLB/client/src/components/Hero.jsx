import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <span className="badge">Clean Label Nutrition</span>
          <h1>Snack smarter with fruit-powered millet nutrition.</h1>
          <p>
            ERLB transforms real fruits and traditional grains into modern snacks that
            taste good, fuel better, and reduce food waste.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn-primary">
              Shop Now
            </Link>
            <a href="#about" className="btn-secondary">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-card">
          <h3>Why ERLB?</h3>
          <ul>
            <li>3-month shelf life with clean formulation</li>
            <li>Third-party lab certified safety</li>
            <li>Affordable health-first snacking</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Hero;
