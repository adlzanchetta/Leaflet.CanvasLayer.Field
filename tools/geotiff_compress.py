import xarray as xr
import numpy as np
import rioxarray
import argparse
import sys
import os

# ## CONS ############################################################################################################ #

DEFAULT_DATATYPE = 'uint8'
DATATYPE_VALUE_RANGE = {
    'uint8': (0, 255),
    'uint16': (0, 65535),
    'int8': (-128, 127),
    'int16': (-32768, 32767)
}

METAVAR_ADD_NAME = 'META_ADD'
METAVAR_MULT_NAME = 'META_MULT'


# ## DEFS (ALL) ###################################################################################################### #

def define_direct_coefficients(da: xr.DataArray, args) -> (float, float):
    """

    :param da:
    :param args:
    :return: (addition coef., multiplication coef.)
    """

    # get extreme values
    min_src = np.min(da.values) if args.i_data_min is None else args.i_data_min
    max_src = np.max(da.values) if args.i_data_max is None else args.i_data_max
    min_trg, max_trg = DATATYPE_VALUE_RANGE[args.o_dtype][0], DATATYPE_VALUE_RANGE[args.o_dtype][1]

    # calculate coefs
    coef_add_raw = min_trg - min_src
    coef_mult_raw = (max_trg - min_trg) / (max_src - min_src)

    return coef_add_raw, coef_mult_raw


def read_args():
    """

    :return:
    """

    # parse terminal command args
    parser = argparse.ArgumentParser(description="Scales a geotiff file values into another datatype.")
    parser.add_argument("-i_file", type=str, metavar='some_folder/input.tiff', dest='i_file',
                        required=True, help='Input file path.')
    parser.add_argument("-o_file", type=str, metavar='some_folder/output.tiff', dest='o_file',
                        required=True, help='Input file path.')
    parser.add_argument("-i_data_min", type=float, metavar='0.0', default=None, dest='i_data_min',
                        required=False, help='TODO')
    parser.add_argument("-i_data_max", type=float, metavar='100.0', default=None, dest='i_data_max',
                        required=False, help='TODO')
    parser.add_argument("-o_dtype", type=str, metavar='uint8', default='uint8', dest='o_dtype',
                        required=False, help='Input file dtype.')
    parser.add_argument("-o_metavar_name_add", type=str, metavar=METAVAR_ADD_NAME, default=METAVAR_ADD_NAME,
                        dest='o_metavar_name_add', required=False, help='TODO')
    parser.add_argument("-o_metavar_name_mult", type=str, metavar=METAVAR_MULT_NAME, default=METAVAR_MULT_NAME,
                        dest='o_metavar_name_mult', required=False, help='TODO')
    args = parser.parse_args()

    # consistency check
    if args.o_dtype not in DATATYPE_VALUE_RANGE.keys():
        sys.exit("Data type '{0}' not supported. Supported datatypes: {1}".format(args.o_dtype,
                                                                                  list(DATATYPE_VALUE_RANGE.keys())))

    return args


# ## DEFS - MAIN ##################################################################################################### #

def main():

    # read arguments
    args = read_args()

    # read input file
    if not os.path.exists(args.i_file):
        sys.exit("Input file not found: %s" % args.i_file)
    da = xr.open_rasterio(args.i_file)
    da.close()

    # estimate add/mult linear raw and inverse coefficients
    add_raw_coef, mult_raw_coef = define_direct_coefficients(da, args)
    add_inv_coef = -add_raw_coef
    mult_inv_coef = mult_raw_coef if mult_raw_coef == 0 else 1/mult_raw_coef

    # modify file data
    da.values[:, :, :] = (da.values + add_raw_coef) * mult_raw_coef
    da.values = da.values.astype(args.o_dtype)

    # modify file metadata
    da.attrs[args.o_metavar_name_add] = add_inv_coef
    da.attrs[args.o_metavar_name_mult] = mult_inv_coef
    if da.attrs["crs"].startswith("+init="):
        da.attrs["crs"] = da.attrs["crs"][6:]

    # write
    da.rio.to_raster(args.o_file)
    print("Wrote: %s" % args.o_file)

    return


# ## MAIN ############################################################################################################ #

if __name__ == "__main__":
    main()
