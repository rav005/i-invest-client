import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class HttpRequestInterceptor implements HttpInterceptor {
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const apiUrl = environment.apiUrl;

        const authToken = localStorage.getItem('token');
        
        if (authToken) {
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