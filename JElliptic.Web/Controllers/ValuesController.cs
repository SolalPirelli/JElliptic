using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Web.Http;

namespace JElliptic.Web.Controllers
{
    public class ValuesController : ApiController
    {
        private static readonly ISet<CurvePoint> _points = new HashSet<CurvePoint>();
        private static readonly IList<Tuple<CurvePoint, CurvePoint>> _collisions = new List<Tuple<CurvePoint, CurvePoint>>();

        // GET api/Values
        public IEnumerable<string> Get()
        {
            return _collisions.Select( t => "Collision: " + t.Item1 + " / " + t.Item2 )
                              .Concat( _points.Select( p => p.ToString() ) );
        }

        // POST api/Values
        public CurvePoint Post( CurvePoint point )
        {
            if ( _points.Contains( point ) ) // collision, not the same U/V
            {
                var existing = _points.First( p => p.Equals( point ) );
                if ( existing.V != point.V )
                {
                    var collision = Tuple.Create( point, existing );
                    _collisions.Add( collision );
                }
            }
            else
            {
                _points.Add( point );
            }

            return point;
        }

        // DELETE api/Values
        public string Delete()
        {
            _points.Clear();
            _collisions.Clear();
            return "OK!";
        }

        public sealed class CurvePoint
        {
            public readonly BigInteger X;
            public readonly BigInteger Y;

            public readonly BigInteger U;
            public readonly BigInteger V;

            public CurvePoint( string x, string y, string u, string v )
            {
                X = BigInteger.Parse( x );
                Y = BigInteger.Parse( y );
                U = BigInteger.Parse( u );
                V = BigInteger.Parse( v );
            }

            public override int GetHashCode()
            {
                return X.GetHashCode() + 31 * Y.GetHashCode();
            }

            public override bool Equals( object obj )
            {
                var point = obj as CurvePoint;
                if ( point == null )
                {
                    return false;
                }

                return X == point.X && Y == point.Y;
            }

            public override string ToString()
            {
                return "X: " + X + ", Y: " + Y + ", U: " + U + ", V: " + V;
            }
        }
    }
}