Semester project at the [Laboratory for Cryptologic Algorithms](http://lacal.epfl.ch/) (LACAL) @ EPFL, Switzerland.

The aim of this project was to develop a website that could run iterations of Pollard's rho algorithm over elliptic curves.
Such a website could then be used by white-hat security efforts to solve an ECDLP instance with the help of many individuals, without having to distribute a compiled program (which users must trust, install, run, and keep up-to-date).

In the end, while browsers can run JavaScript at quite an impressive speed, it is not fast enough compared to a native C implementation using GMP.

Detailed information can be found in the [PDF report](https://github.com/SolalPirelli/JElliptic/blob/master/Report.pdf).

The program itself, and its tests and benchmarks, can be run [here](http://solalpirelli.github.io/JElliptic/).
