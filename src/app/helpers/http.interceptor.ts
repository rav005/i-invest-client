import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class HttpRequestInterceptor implements HttpInterceptor {
    constructor(private router: Router) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const apiUrl = environment.apiUrl;

        const authToken = sessionStorage.getItem('token');

        if (authToken) {
            var tData = authToken.split('.')[1];
            let tokenValue = JSON.parse(window.atob(tData));
            const d = new Date(tokenValue.exp * 1000);
            if (new Date().getTime() > d.getTime()) {
                sessionStorage.clear();
                window.location.reload();
            }

            const authReq = req.clone({
                url: apiUrl + req.url,
                headers: req.headers.set('Authorization', authToken)
            });

            return next.handle(authReq);
        } else {
            const urlReq = req.clone({
                url: apiUrl + req.url
            });
            return next.handle(urlReq);
        }
    }

}