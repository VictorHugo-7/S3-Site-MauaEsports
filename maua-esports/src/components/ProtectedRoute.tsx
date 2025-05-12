// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { instance } = useMsal();
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState<string | null>(null);

  console.log('ProtectedRoute - initial render');

  React.useEffect(() => {
    console.log('ProtectedRoute - useEffect running');
    const checkAuthAndRole = async () => {
      const account = instance.getActiveAccount();
      console.log('Active account:', account);
      
      if (!account) {
        console.log('No active account, will redirect');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching user data for:', account.username);
        const response = await fetch(`http://localhost:3000/usuarios/por-email?email=${encodeURIComponent(account.username)}`);
        if (response.ok) {
          const userData = await response.json();
          console.log('User data:', userData);
          setUserRole(userData.usuario?.tipoUsuario || null);
        } else {
          console.log('Failed to fetch user data');
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
      } finally {
        console.log('Finished checking auth and role');
        setIsLoading(false);
      }
    };

    checkAuthAndRole();
  }, [instance]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-azul-claro"></div>
  </div>;
  }

  const account = instance.getActiveAccount();
  if (!account) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/nao-autorizado" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;