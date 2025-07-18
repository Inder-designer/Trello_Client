import { FavoriteBorderOutlined, FavoriteOutlined, LocalGasStationOutlined, StarRounded } from '@mui/icons-material';
import { door, gear, pass } from '../../assets/Icons'
import { Link } from 'react-router'
import { Car12 } from '../../assets/images';
import useWishlist from '../../hooks/useWishlist';
import { ICar } from '../../Types/car';
import { useSelector } from 'react-redux';

interface CarCardProps {
    car?: ICar;
    forSale?: boolean;
}
const CarCard = ({ car, forSale = true }: CarCardProps) => {
    const { isAuthenticated } = useSelector((state: any) => state.auth);
    const { isWishlisted, toggleWishlist } = useWishlist(car?.isWishlisted, car?._id);

    return (
        <div className='bg-[#fefefe] shadow-xs hover:shadow-[0px_0px_15px_-10px_rgba(66,68,90,1)] duration-300 border border-black/5 rounded-2xl p-3 relative'>
            {/* <Link to="/car/1" className='absolute top-0 left-0 w-full h-full' ></Link> */}
            <div className='h-[200px] relative'>
                {isAuthenticated &&
                    <button className="w-8 h-8 flex items-center justify-center border border-border1 absolute top-2 right-2 bg-white rounded-full text-primary cursor-pointer" onClick={toggleWishlist}>
                        {isWishlisted ?
                            <FavoriteOutlined className='!text-lg' />
                            :
                            <FavoriteBorderOutlined className='!text-lg' />
                        }
                    </button>
                }
                <img src={car?.thumbnail || Car12} alt="" className='w-full h-full object-cover rounded-2xl' />
            </div>
            <div className='mt-3'>
                <div className='flex items-center justify-between'>
                    <h4 className='text-color1 font-semibold text-lg'>{car?.title}</h4>
                    <span className='font-semibold text-sm flex items-center'><StarRounded className='!text-xl text-primary' /> 4.5</span>
                </div>
                <div className='flex items-center justify-between'>
                    <span className='text-color2 text-sm capitalize'>{car?.carType}</span>
                </div>
                <div className='flex items-center justify-between mt-2 pb-2'>
                    <span className='text-color2 text-sm flex items-center gap-1'><img src={pass} className='w-4' />{car?.seats}</span>
                    <span className='text-color2 text-sm flex items-center gap-1'><img src={gear} className='w-4' />{car?.transmission}</span>
                    <span className='text-color2 text-sm flex items-center gap-1'><img src={door} className='w-4' />{car?.doors}</span>
                    <span className='text-color2 text-sm flex items-center gap-1'><LocalGasStationOutlined className='!text-xl' />{car?.fuelType}</span>
                </div>
            </div>
            <div className="pt-3 mt-2 border-t border-border flex justify-between items-center relative">
                <span className="text-xl font-bold text-gray-800">
                    ₹{!forSale ? car?.rentPrice?.price : car?.price}
                    {!forSale && <span className="text-sm font-normal text-gray-600">/day</span>}
                </span>
                <Link to={`/car/${car?._id}`} className="btn3 text-sm py-2 px-4">
                    {forSale ? 'Buy Now' : 'Rent Now'}
                </Link>
            </div>
        </div>
    )
}

export default CarCard