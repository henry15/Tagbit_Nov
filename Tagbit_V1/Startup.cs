using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Tagbit_V1.Startup))]
namespace Tagbit_V1
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //ConfigureAuth(app);
        }
    }
}
