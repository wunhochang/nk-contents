using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GAPI.Entity.Common
{
    public class APITreeResult: APIResult
    {
        public new IEnumerable<Gentity> Data { get; internal set; }
    }
}
