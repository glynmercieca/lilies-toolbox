import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { FirebaseAuthService } from './firebase-auth.service';

export const homeRedirectGuard: CanActivateFn = async (route) => {
  const auth = inject(FirebaseAuthService);
  const router = inject(Router);
  const shouldOpenNotifications = route.queryParamMap.get('notifications') === 'open';
  const redirectExtras = shouldOpenNotifications
    ? { queryParams: { notifications: 'open' } }
    : undefined;

  if (auth.currentUser()) {
    return router.createUrlTree(['/shed'], redirectExtras);
  }

  const isAuthenticated = await auth.ensureValidSession();
  if (isAuthenticated) {
    return router.createUrlTree(['/shed'], redirectExtras);
  }

  return true;
};
