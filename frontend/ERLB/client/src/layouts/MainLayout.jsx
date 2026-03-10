import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const MainLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
