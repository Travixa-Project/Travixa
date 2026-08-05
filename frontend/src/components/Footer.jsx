import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Left Section */}
          <div className="footer-column">
            <h2 className="footer-title">Travixa</h2>
            <div className="footer-subtitle">Tour Management System</div>
            <p className="footer-description">
              "An academic project developed for secure tour package booking, online payments, wishlist management, customer reviews, enquiries, and AI-assisted travel support."
            </p>
          </div>

          {/* Center Section */}
          <div className="footer-column">
            <h3 className="footer-section-heading">Project Developed By</h3>
            <ul className="footer-list">
              <li>Vaishnavi Shinde</li>
              <li>Janhavi Patil</li>
              <li>Vishvesh Patil</li>
              <li>Shreyas Ghule</li>
            </ul>
          </div>

          {/* Right Section */}
          <div className="footer-column">
            <h3 className="footer-section-heading">Contact Information</h3>

            <div className="footer-subheading">Email</div>
            <ul className="footer-list">
              <li>vaishnavi@gmail.com</li>
              <li>janhavi2703patil@gmail.com</li>
              <li>patilvishu2122@gmail.com</li>
              <li>shreyas@gmail.com</li>
            </ul>

            <div className="footer-subheading">Address</div>
            <address className="footer-address">
              SunBeam Institute of Information Technology,<br />
              Karad - 415110,<br />
              Maharashtra, India
            </address>
          </div>
        </div>

        {/* Separator Line */}
        <hr className="footer-divider" />

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© 2026 Travixa | Tour Management System</p>
          <p className="footer-bottom-tech">
            Developed as an Academic Project using
          </p>
          <p className="footer-bottom-tech">
            Spring Boot • .NET • React • MySQL • Python AI
          </p>
        </div>
      </div>
    </footer>
  );
}
