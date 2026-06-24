import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  if (!req.url.includes('/admin')) {
    return next(req);
  }

  const clonedReq = req.clone({
    setHeaders: {
      Authorization: 'Bearer xyz',
    },
  });

  return next(clonedReq);
};