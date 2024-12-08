'use client';

import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useEffect, useReducer } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import axios from 'axios';
import defaultImage from '@/public/shopowner.webp';
import { useState } from 'react';
import { set } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type StateType = {
  firstname: string;
  lastname: string;
  email: string;
  imageURL: string;
  isEditing: boolean;
  isUploading: boolean;
  imagePreview: string;
};

type ActionType =
  | { type: 'SET_FIELD'; field: keyof StateType; value: any }
  | { type: 'RESET_FIELDS'; payload: Partial<StateType> };

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET_FIELDS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default function ProfileCreateForm({
  data
}: {
  data: {
    id: string | null;
    user_name: string;
    email: string;
    imageURL: string;
  };
}) {
  const initialState: StateType = {
    firstname: '',
    lastname: '',
    email: data.email,
    imageURL: data.imageURL || defaultImage.src,
    isEditing: false,
    isUploading: false,
    imagePreview: data.imageURL || defaultImage.src
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const methods = useForm({
    defaultValues: {
      firstname: '',
      lastname: '',
      email: data.email
    },
    mode: 'onSubmit'
  });

  useEffect(() => {
    const nameParts = data.user_name.split(' ');
    dispatch({
      type: 'RESET_FIELDS',
      payload: {
        firstname: nameParts[0] || '',
        lastname: nameParts[1] || '',
        email: data.email,
        imageURL: data.imageURL
      }
    });
  }, [data]);

  const handleEditClick = async () => {
    if (state.isEditing) {
      await updateProfile();
    }
    dispatch({
      type: 'SET_FIELD',
      field: 'isEditing',
      value: !state.isEditing
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({ type: 'SET_FIELD', field: name as keyof StateType, value });
  };

  const updateProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const user_name = `${state.firstname} ${state.lastname}`;
      const respone = await axios.put(
        `${API_URL}/api/updateProfile`,
        {
          user_name,
          email: state.email,
          image_url: state.imageURL
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error: any) {}
    setLoading(false);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsUploading(true);
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    dispatch({ type: 'SET_FIELD', field: 'isUploading', value: true });

    try {
      const response = await axios.post(`${API_URL}/api/imageupload`, formData);
      if (response.data?.data?.url) {
        dispatch({
          type: 'RESET_FIELDS',
          payload: {
            imagePreview: response.data.data.url,
            imageURL: response.data.data.url
          }
        });
      } else {
        throw new Error('Image upload failed.');
      }
    } catch (error) {
    } finally {
      setIsUploading(false);
      dispatch({ type: 'SET_FIELD', field: 'isUploading', value: false });
    }
  };

  const selectImagePreview = () => {
    if (typeof state.imagePreview === 'string') {
      return state.imagePreview;
    }
    if (typeof state.imageURL === 'string') {
      return state.imageURL;
    }
    return typeof defaultImage === 'object' ? defaultImage.src : defaultImage;
  };

  const onSubmit = async () => {
    await updateProfile();
  };

  return (
    <FormProvider {...methods}>
      <div className="flex items-center justify-between">
        <Heading title="Profile" description="Manage your profile details" />
      </div>

      <Separator />

      <div className="h-60 w-60 border">
        <img
          src={selectImagePreview()}
          alt="Profile Image"
          className="full h-60 w-60 object-cover"
        />
      </div>

      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="w-full space-y-8">
          <div className="gap-8 md:grid md:grid-cols-3">
            <div className="col-span-2 space-y-4">
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Controller
                    name="firstname"
                    control={methods.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        disabled={!state.isEditing}
                        value={state.firstname}
                        onChange={handleInputChange}
                      />
                    )}
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Controller
                    name="lastname"
                    control={methods.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        disabled={!state.isEditing}
                        value={state.lastname}
                        onChange={handleInputChange}
                      />
                    )}
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Controller
                    name="email"
                    control={methods.control}
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value:
                          /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                        message: 'Invalid email format'
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        disabled={!state.isEditing}
                        value={state.email}
                        onChange={handleInputChange}
                      />
                    )}
                  />
                </FormControl>
              </FormItem>

              {state.isEditing && (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
                  <FormControl>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}

              <Button
                variant="default"
                onClick={handleEditClick}
                disabled={state.isUploading || loading}
              >
                {state.isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
