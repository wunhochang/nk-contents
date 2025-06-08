using GAPI.Common;
using GAPI.Entity;
using GAPI.Entity.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace GAPI.Controllers
{
    public partial class GController : Microsoft.AspNetCore.Mvc.Controller
    {
        [HttpGet]
        [Authorize]
        public APIResult Get([FromQuery]string condition)
        {
            try
            {
                _logger.LogInformation("Get List Called. Controller name = " + controller_name + ", Entity name = " + entity_name);
                //condition = "{\"oper_user_no\":\"1\",\"txtsearch\":\"\",\"use_yn\":\"\",\"page\":1,\"start\":0,\"limit\":20}";
                CheckAuthNLogging(condition);

                var data = new Hashtable();

                if (!string.IsNullOrWhiteSpace(condition))
                    data = JsonConvert.DeserializeObject<Hashtable>(condition);

                AddDefaultParams(data);

                result.Data = entity.List(data);
                result.Success = true;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }


        [HttpGet("{id}")]
        [Authorize]
        public APIResult Get(int id)
        {
            try
            {
                _logger.LogInformation("Get Called. id = " + id.ToString() + ", Controller name = " + controller_name + ", Entity name = " + entity_name);

                CheckAuthNLogging(id);

                var hsCondition = new Hashtable();

                AddDefaultParams(hsCondition, id);

                result.Data = entity.List(hsCondition);
                result.Success = true;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        [HttpPost]
        [Authorize]
        public APIResult Post([FromBody]string value)
        {
            try
            {
                _logger.LogInformation("Post Called. Controller name = " + controller_name + ", Entity name = " + entity_name);

                CheckAuthNLogging(value);

                string jsonData = value;

                Hashtable data = JsonConvert.DeserializeObject<Hashtable>(jsonData);

                AddDefaultParams(data);
                
                var id = entity.Insert(data);

                if (data["files"] != null && data["files"].ToString() != "")
                {
                    List<Hashtable> files = JsonConvert.DeserializeObject<List<Hashtable>>(data["files"].ToString());

                    var effected = new Upload().UpdateFiles(files, id, decimal.Parse(data["oper_user_no"].ToString()));
                }
                
                result.Success = true;
                result.NewID = id;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        [HttpPut("{id}")]
        [Authorize]
        public APIResult Put(int id, [FromBody]string value)
        {
            try
            {
                _logger.LogInformation("Put Called. id = " + id.ToString() + ", Controller name = " + controller_name + ", Entity name = " + entity_name);

                CheckAuthNLogging(value);

                string jsonData = value;

                Hashtable data = JsonConvert.DeserializeObject<Hashtable>(jsonData);

                AddDefaultParams(data, id);
                
                entity.Update(data);

                result.Success = true;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        [HttpDelete("{id}")]
        [Authorize]
        public APIResult Delete(int id)
        {
            try
            {
                _logger.LogInformation("Delete Called. id = " + id.ToString() + ", Controller name = " + controller_name + ", Entity name = " + entity_name);
                
                CheckAuthNLogging(id);

                var data = new Hashtable();
                AddDefaultParams(data, id);

                result.Success = entity.Delete(data);
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        [HttpDelete]
        [Authorize]
        public APIResult DeleteMulti([FromBody]int[] ids)
        {
            try
            {
                _logger.LogInformation("DeleteMulti Called. value = " + ids.ToString() + ", Controller name = " + controller_name + ", Entity name = " + entity_name);

                CheckAuthNLogging(ids);

                var data = new Hashtable();

                string idString = string.Empty;

                foreach (var id in ids)
                {
                    idString += "'" + id.ToString() + "',";
                }

                idString = idString.TrimEnd(',');

                data.Add("ids", idString);

                AddDefaultParams(data);

                result.Success = entity.DeleteMulti(data);                
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }
    }
}
