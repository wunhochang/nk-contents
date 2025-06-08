using GAPI.Entity;
using System.Collections;
using System.Collections.Generic;

namespace GAPI.Entity.Common
{
    public class APIResult
    {
        public decimal count { get; set; }


        public APIResult()
        {
            Errors = new List<Error>();
        }

        public APIResult(bool success, string message)
        {
            this.Success = Success;

            this.Errors = new List<Error>();
            this.Errors.Add(new Error("ERR", message));
        }

        //public IEnumerable<Hashtable> Data { get; internal set; }
        public IEnumerable<object> Data { get; internal set; }

        public bool Success { get; internal set; }
        public List<Error> Errors { get; internal set; }
        public decimal NewID { get; internal set; } 
    }
}