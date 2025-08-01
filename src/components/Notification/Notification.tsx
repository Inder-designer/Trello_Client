import { useNotificationReadMutation } from '@/redux/api/common';
import { readNotification } from '@/redux/Slices/NotificationSlice';
import { Switch } from '@mui/material';
import { formatDistanceToNow, set } from 'date-fns';
import { Bell, BellDot } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface NotificationState {
  notification: {
    notifications: {
      _id: string;
      card: {
        _id: string;
        action: string;
        cardId: {
          _id: string;
          shortLink: string;
          title: string;
          listId: {
            title: string;
          };
        };
        boardId: {
          _id: string;
          title: string;
          background: string;
        };
        comment: {
          message: string;
          createdAt: string;
        };
      };
      createdBy: {
        initials: string;
        fullName: string;
      };
      read: boolean;
      createdAt: string;
    }[];
  };
}

const Notification = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: NotificationState) => state.notification);
  const [notificationRead] = useNotificationReadMutation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unRead, setUnRead] = useState(true);
  const notificationRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close notification
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        bellButtonRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const unreadNotifications = notifications.filter(notification => !notification.read);
  const filteredNotifications = unRead ? unreadNotifications : notifications;

  const handleNavigate = (notification) => {
    const cardId = notification.card.cardId.shortLink || notification.card.cardId._id;
    navigate(`/board/${notification.card.boardId._id}?c=${cardId}`);
    setIsNotificationOpen(false);
  }

  return (
    <>
      <button
        ref={bellButtonRef}
        className='w-7 h-7 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white duration-300'
        onClick={toggleNotification}
      >
        {unreadNotifications.length > 0 ?
          <BellDot size={16} />
          :
          <Bell size={16} />
        }
      </button>

      {/* Notification Div */}
      {isNotificationOpen && (
        <div
          ref={notificationRef}
          className='fixed z-[9999] min-h-[300px] max-h-[calc(100vh_-_100px)] w-96 bg-white border border-gray-200 backdrop-blur-md top-12 right-6 rounded shadow-lg overflow-y-auto'
        >
          <div className='bg-gray-100 p-3 pb-0 relative'>
            <div className='flex items-center justify-between border-b border-gray-300 pb-2'>
              <h4 className='text-lg font-semibold text-gray-600'>Notifications</h4>
              <div className='flex items-center gap-1'>
                <span className='text-xs text-gray-500'>Show only unread</span>
                <Switch
                  color="primary"
                  size="small"
                  checked={unRead}
                  onChange={() => setUnRead(!unRead)}
                />
              </div>
            </div>
          </div>
          <div className='sticky top-0 py-2.5 px-3 flex justify-end bg-gray-100 border-b shadow'>
            <button className='text-xs font-medium text-gray-500 hover:underline hover:text-gray-700'>Mark all as read</button>
          </div>
          <ul className='flex flex-col gap-2 px-3 py-4'>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <li key={index} className='flex items-start gap-2'>
                  <div className="rounded border-b border-gray-200 overflow-hidden w-full">
                    <div className={`p-2 flex flex-col gap-2 bg-gray-200 ${notification?.card?.boardId?.background}`}>
                      <div className='bg-white/40 hover:bg-white/50 cursor-pointer duration-300 px-2 py-1.5 rounded' onClick={() => handleNavigate(notification)}>
                        <h3 className='text-white font-semibold text-sm'>{notification?.card?.cardId?.title}</h3>
                      </div>
                      <p className='text-xs text-white'><span className='capitalize font-bold'>{notification?.card?.boardId?.title}:</span> <span className='capitalize font-medium'>{notification?.card?.cardId?.listId?.title}</span></p>
                    </div>
                    <div className='bg-gray-200 p-2 border-t border-gray-300'>
                      <div >
                        <div className="flex items-start gap-2">
                          <span className='min-w-7 w-7 h-7 rounded-full text-xs flex items-center justify-center bg-red-400 text-white font-medium'>{notification?.createdBy?.initials}</span>
                          <div className='flex flex-col w-full'>
                            <div className='flex justify-between items-center w-full'>
                              <span className='text-sm capitalize font-semibold'>{notification?.createdBy?.fullName}</span>
                              <span className='text-xs text-gray-500'>{formatDistanceToNow(new Date(notification?.createdAt), { addSuffix: true })}</span>
                            </div>
                            <div className='flex flex-col mt-1'>
                              {notification?.card?.action === 'moved' ?
                                <div className='flex items-center gap-1 font-medium'>
                                  <span className='text-xs text-gray-600'>Moved to list: </span>
                                  <span className='text-xs text-gray-600'>{notification?.card?.cardId?.listId?.title}</span>
                                </div>
                                :
                                (notification?.card?.action === 'addMemberToCard' || notification?.card?.action === 'removeMemberFromCard') ?
                                  <div className='flex items-center gap-1 font-medium'>
                                    <span className='text-xs text-gray-600'>{notification?.card?.action === 'addMemberToCard' ? 'Added you to card' : 'Removed you from card'}</span>
                                  </div>
                                  :
                                  <div className='bg-gray-600 px-2 py-1.5 rounded w-fit'>
                                    <p className='text-white text-xs'>{notification?.card?.comment?.message}</p>
                                  </div>
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    className={` w-5 h-5 rounded flex items-center justify-center duration-300 ${notification?.read ? 'cursor-default' : 'hover:bg-blue-200/70'}`}
                    onClick={!notification?.read ? async () => {
                      dispatch(readNotification({ id: notification?._id, read: true }));
                      await notificationRead(notification?._id).catch((err) => {
                        dispatch(readNotification({ id: notification?._id, read: false }));
                      });
                    } : undefined}
                  >
                    {!notification?.read &&
                      <span className='bg-blue-600 rounded-full w-3 h-3 inline-block'></span>
                    }
                  </button>
                </li>
              ))
            ) : (
              <li className="p-4 text-gray-500 text-center">No notifications</li>
            )}
          </ul>
        </div>
      )}
    </>
  )
}

export default Notification