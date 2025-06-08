using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GAPI
{
    public static class Logging
    {
        public static ILoggerFactory LoggerFactory { get; set; }
        public static ILogger CreateLogger<T>() =>
          LoggerFactory.CreateLogger<T>();
    }
}
