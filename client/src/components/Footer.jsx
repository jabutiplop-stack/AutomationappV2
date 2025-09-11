export default function Footer() {
    return (
      <footer style={{padding:24,borderTop:'1px solid #eee',textAlign:'center'}}>
        <small>© {new Date().getFullYear()} AutomationApp</small>
      </footer>
    );
  }