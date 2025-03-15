// Define the props interface for the layout component
interface LayoutProps {
  children: React.ReactNode; // Accepts React nodes as children
}

// Authentication layout component
const Layout = ({ children }: LayoutProps) => {
  return (
    // Center the authentication pages on the screen
    <div className="min-h-screen flex items-center justify-center">
      {children} {/* Render the child components (SignIn, SignUp, etc.) */}
    </div>
  );
};

export default Layout;
