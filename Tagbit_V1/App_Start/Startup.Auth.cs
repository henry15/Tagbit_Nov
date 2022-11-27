using System;
using System.Net;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security.Cookies;
using Microsoft.Owin.Security.Google;
using Owin;
using Tagbit_V1.Models;

namespace Tagbit_V1
{
    public partial class Startup
    {
        // For more information on configuring authentication, please visit https://go.microsoft.com/fwlink/?LinkId=301864
        public void ConfigureAuth(IAppBuilder app)
        {
            // Configure the db context, user manager and signin manager to use a single instance per request
            app.CreatePerOwinContext(ApplicationDbContext.Create);
            app.CreatePerOwinContext<ApplicationUserManager>(ApplicationUserManager.Create);
            app.CreatePerOwinContext<ApplicationSignInManager>(ApplicationSignInManager.Create);

            // Enable the application to use a cookie to store information for the signed in user
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                AuthenticationType = DefaultAuthenticationTypes.ApplicationCookie,
                LoginPath = new PathString("/Account/LogOn")
            });

            app.UseExternalSignInCookie(DefaultAuthenticationTypes.ExternalCookie);

            // App.Secrets is application specific and holds values in CodePasteKeys.json
            // Values are NOT included in repro – auto-created on first load
            if (!string.IsNullOrEmpty("760716553564-pd8vj09opccc3i2es7mb6lmllvu1ifvh.apps.googleusercontent.com"))
            {
                app.UseGoogleAuthentication(
                    clientId: "760716553564-pd8vj09opccc3i2es7mb6lmllvu1ifvh.apps.googleusercontent.com",
                    clientSecret: "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");
            }


          //  AntiForgeryConfig.UniqueClaimTypeIdentifier = ClaimTypes.NameIdentifier;

            //app.UseGoogleAuthentication(new GoogleOAuth2AuthenticationOptions()
            //{
            //    ClientId = "760716553564-pd8vj09opccc3i2es7mb6lmllvu1ifvh.apps.googleusercontent.com",
            //    ClientSecret = "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"
            //});
        }

    }
}