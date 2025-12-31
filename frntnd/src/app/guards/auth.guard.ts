import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const token =
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
      ? window.localStorage.getItem('x-token') || window.localStorage.getItem('token')
      : null;
  if (token) return true;

  const router = inject(Router);
  router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
  return false;
};
