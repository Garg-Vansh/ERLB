import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>ERLB</h4>
          <p>Clean-label, millet-rich snacks built for everyday Indian nutrition.</p>
          <p>FSSAI Lic. No: 10012022000123 (sample placeholder)</p>
        </div>
        <div>
          <h4>Legal</h4>
          <p><Link to="/legal/privacy">Privacy Policy</Link></p>
          <p><Link to="/legal/terms">Terms & Conditions</Link></p>
          <p><Link to="/legal/refund-shipping">Refund & Shipping</Link></p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Email: care@erlb.in</p>
          <p>Phone: +91 99999 99999</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
