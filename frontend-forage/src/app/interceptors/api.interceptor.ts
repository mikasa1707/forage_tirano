import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req); // SSR safe bypass
  }
  console.log('HTTP interceptor fired');
  const clonedReq = req.clone({
    headers: req.headers.set('Authorization', 'Bearer xyz'),
  });

  return next(clonedReq);
};