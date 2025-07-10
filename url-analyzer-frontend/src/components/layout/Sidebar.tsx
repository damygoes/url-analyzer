
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

// const navigation = [
//   { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
//   { name: 'System Health', href: '/health', icon: Activity },
// ];

export function Sidebar({ open, onClose }: SidebarProps) {
//   const [collapsed, setCollapsed] = useState(false);
console.log('Sidebar open:', open);
console.log('Sidebar onClose:', onClose);

  return (
    <div> Sidebar component </div>
  );
}