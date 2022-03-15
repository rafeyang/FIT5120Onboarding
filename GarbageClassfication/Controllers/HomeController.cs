using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using GarbageClassfication.Models;
using Newtonsoft.Json;

namespace GarbageClassfication.Controllers
{
    public class HomeController : Controller
    {
        private cleanvictoriaEntities db = new cleanvictoriaEntities();
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Information()
        {
            var result = from c in db.Info select c;
            var g = result.ToList();
            Dictionary<string, int> yp = new Dictionary<string, int>();
            List<Dictionary<string, int>> list = new List<Dictionary<string, int>>();
            yp.Add("x", 1995);
            yp.Add("y", 13);

            list.Add(yp);
            for (int i = 0; i < 9; i++)
            {
                int a = yp["x"];
                int b = yp["y"];
                yp["x"] = a + 1;
                yp["y"] = b + 5;
                list.Add(yp);
                list[i] = yp;
            }
            var json = JsonConvert.SerializeObject(g);
            ViewBag.Info = json;
            return View();
        }
        public ActionResult Classfication()
        {
            return View();
        }
    }
}