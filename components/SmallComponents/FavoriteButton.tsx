// components/FavoriteButton.tsx
import { HeartIcon } from "@/public/allIcons/page";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useMemo } from "react";
import axios from "axios";
import { updateUser } from "@/lib/store/slices/authSlice";
import Swal from "sweetalert2";

interface FavoriteButtonProps {
  _id: string;
}

export const FavoriteButton = ({ _id }: FavoriteButtonProps) => {
  const userData = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const handleFavoritesUpdate = async (add: boolean, activityId: string) => {
    if (!userData) return;

    const current = userData.favorites ?? [];
    const updatedFavorites = add
      ? [...current, activityId]
      : current.filter((id) => id.toString() !== activityId);

    const response = await axios.put("/api/profile", {
      id: userData.id,
      favorites: updatedFavorites,
    });

    dispatch(
      updateUser({
        ...userData,
        favorites: response?.data?.user?.favorites,
      })
    );
  };

  const isFavorite = useMemo(() => {
    return userData?.favorites?.includes(_id) ? true : false;
  }, [userData?.favorites]);

  return (
    <>
      {isFavorite ? (
        <div
          className="bg-[#B32053] h-[26px] w-[26px] rounded-[6px] flex justify-center items-center cursor-pointer"
          onClick={() => {
            Swal.fire({
              title: "Remove Favorite",
              text: "Are you sure you want to remove this from Favorites?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#B32053",
              cancelButtonColor: "#d33",
              confirmButtonText: "Remove",
            }).then((result) => {
              if (result.isConfirmed) {
                handleFavoritesUpdate(false, _id);
              }
            });
          }}
        >
          <HeartIcon color="white" />
        </div>
      ) : (
        <div
          className="bg-white h-[26px] w-[26px] rounded-[6px] flex justify-center items-center cursor-pointer"
          onClick={() => {
            handleFavoritesUpdate(true, _id);
          }}
        >
          <HeartIcon color="#B32053" />
        </div>
      )}
    </>
  );
};
