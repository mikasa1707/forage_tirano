import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const clonedReq = req.clone({
    headers: req.headers.set('Authorization', 'Bearer xyz'),
  });
  return next(clonedReq);
};
