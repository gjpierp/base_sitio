import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const loginRedirectGuard: CanActivateFn = (route, state) => {
  const token =
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
      ? window.localStorage.getItem('x-token') || window.localStorage.getItem('token')
      : null;
  if (token) {
    const router = inject(Router);
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
