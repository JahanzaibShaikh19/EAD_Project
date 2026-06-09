// frontend/src/hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectToken,
  selectUser,
  selectIsAuthenticated,
  selectRole,
  selectIsHR,
  clearCredentials,
} from '../store/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);
  const isHR = useSelector(selectIsHR);

  const logout = () => {
    dispatch(clearCredentials());
    navigate('/login', { replace: true });
  };

  return {
    token,
    user,
    isAuthenticated,
    role,
    isHR,
    isEmployee: role === 'employee',
    logout,
  };
}

export default useAuth;
