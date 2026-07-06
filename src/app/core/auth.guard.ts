import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { FirebaseAuthService } from './firebase-auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(FirebaseAuthService);
  const router = inject(Router);

  if (auth.currentUser()) {
    return true;
  }

  return auth.ensureValidSession().then((isAuthenticated) => {
    if (isAuthenticated) {
      return true;
    }

    return router.createUrlTree(['/home'], {
      queryParams: { returnUrl: state.url },
    });
  });
};
