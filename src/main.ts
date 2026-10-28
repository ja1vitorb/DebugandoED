import { bootstrapApplication } from '@angular/platform-browser';

import {importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { appRouting } from './app/app.routes';
import { AuthInterceptor } from './app/services/auth.interceptor';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

// Loader simples lendo /assets/i18n/{lang}.json
class JsonTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`assets/i18n/${lang}.json`);
  }
}

function loaderFactory(http: HttpClient) {
  return new JsonTranslateLoader(http);
}

bootstrapApplication(AppComponent, {
  providers: [
    appRouting,
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: loaderFactory,
          deps: [HttpClient]
        }
      }),
      HttpClientModule
    ),
    // Register interceptor provider
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  ]
});
