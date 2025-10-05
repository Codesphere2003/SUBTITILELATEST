import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-all duration-300 hover:scale-105">
            <span className="text-lg font-bold text-foreground font-poppins">
              GlobalLingo AI 
            </span>
          </Link>
          
          <nav className="hidden md:flex md:items-center gap-8 font-montserrat font-semibold">
            <Link to="/" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-110">
              Home
            </Link>
            <Link to="/feature" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-110">
              Feature
            </Link>
            <Link to="/pricing" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-110">
              Pricing
            </Link>
            {/* <Link to="/upload" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-110">
              Uploads
            </Link> */}
            <Link to="/projects" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-110">
              Projects
            </Link>
            {/* <Link to="/account" className="text-foreground hover:text-primary transition-all duration-300 hover:scale-110">
              Account
            </Link> */}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
