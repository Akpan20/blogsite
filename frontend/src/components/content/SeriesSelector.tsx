import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Series {
  id: number;
  title: string;
  slug: string;
  description?: string;
  posts_count: number;
  user: {
    id: number;
    name: string;
  };
}

interface SeriesSelectorProps {
  postId: number;
  currentSeries?: Series[];
  onChange?: (series: Series[]) => void;
}

export default function SeriesSelector({
  postId,
  currentSeries = [],
  onChange,
}: SeriesSelectorProps) {
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series[]>(currentSeries);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeriesDescription, setNewSeriesDescription] = useState('');
  const [orderInput, setOrderInput] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/series', {
        params: { include_unpublished: true },
      });
      setAllSeries(data.data || data);
    } catch (error) {
      console.error('Failed to fetch series:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToSeries = async (series: Series) => {
    const order = orderInput[series.id] || undefined;

    try {
      await axios.post(`/api/series/${series.id}/posts`, {
        post_id: postId,
        order,
      });

      const updatedSeries = [...selectedSeries, series];
      setSelectedSeries(updatedSeries);
      onChange?.(updatedSeries);
      alert(`Post added to "${series.title}"!`);
    } catch (error: any) {
      console.error('Failed to add post to series:', error);
      alert(error.response?.data?.message || 'Failed to add post to series');
    }
  };

  const removeFromSeries = async (series: Series) => {
    if (!confirm(`Remove post from "${series.title}"?`)) return;

    try {
      await axios.delete(`/api/series/${series.id}/posts/${postId}`);

      const updatedSeries = selectedSeries.filter((s) => s.id !== series.id);
      setSelectedSeries(updatedSeries);
      onChange?.(updatedSeries);
    } catch (error) {
      console.error('Failed to remove post from series:', error);
      alert('Failed to remove post from series');
    }
  };

  const createSeries = async () => {
    if (!newSeriesTitle.trim()) {
      alert('Series title is required');
      return;
    }

    try {
      const { data } = await axios.post('/api/series', {
        title: newSeriesTitle,
        description: newSeriesDescription,
        is_published: true,
      });

      // Add post to the new series
      await addToSeries(data);

      // Refresh series list
      fetchSeries();

      // Close modal and reset
      setIsCreating(false);
      setNewSeriesTitle('');
      setNewSeriesDescription('');
    } catch (error) {
      console.error('Failed to create series:', error);
      alert('Failed to create series');
    }
  };

  const isInSeries = (seriesId: number) =>
    selectedSeries.some((s) => s.id === seriesId);

  const availableSeries = allSeries.filter((s) => !isInSeries(s.id));

  return (
    <div className="w-full">
      {/* Currently In Series */}
      {selectedSeries.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Currently in {selectedSeries.length} series:
          </h3>
          <div className="space-y-2">
            {selectedSeries.map((series) => (
              <div
                key={series.id}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">{series.title}</h4>
                  {series.description && (
                    <p className="text-sm text-blue-700 mt-1">
                      {series.description}
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-1">
                    {series.posts_count} posts by {series.user.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromSeries(series)}
                  className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add to Series Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
      >
        + Add to Series
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {isCreating ? 'Create New Series' : 'Add to Series'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsCreating(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isCreating ? (
                // Create New Series Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Series Title *
                    </label>
                    <input
                      type="text"
                      value={newSeriesTitle}
                      onChange={(e) => setNewSeriesTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Laravel Mastery"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newSeriesDescription}
                      onChange={(e) => setNewSeriesDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="A comprehensive guide to..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={createSeries}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create & Add Post
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                // Select Existing Series
                <>
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : availableSeries.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No available series</p>
                      <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create New Series
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="w-full mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        + Create New Series
                      </button>

                      <div className="space-y-3">
                        {availableSeries.map((series) => (
                          <div
                            key={series.id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {series.title}
                                </h3>
                                {series.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {series.description}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                  {series.posts_count} posts • by {series.user.name}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                              <input
                                type="number"
                                min="1"
                                placeholder="Order (optional)"
                                value={orderInput[series.id] || ''}
                                onChange={(e) =>
                                  setOrderInput({
                                    ...orderInput,
                                    [series.id]: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-32 px-3 py-1 border border-gray-300 rounded text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => addToSeries(series)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Add to Series
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}