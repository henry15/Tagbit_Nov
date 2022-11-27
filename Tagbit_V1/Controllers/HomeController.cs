using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Tagbit_V1.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View(); 
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Home()
        {
            //OrderContext context = HttpContext.RequestServices.GetService(typeof(OrderContext)) as OrderContext;
            //context.GetOrderData();
            return View();
            //   return View();
        }
        public ActionResult Dashboard()
        {
            return View();
        }
        public ActionResult Design()
        {
            return View();
        }
        public ActionResult Sample()
        {
            return View();
        }
        public ActionResult ProductDetails()
        {
            return View();
        }

        public ActionResult MyCanvas()
        {
            return View();
        }
    }
}