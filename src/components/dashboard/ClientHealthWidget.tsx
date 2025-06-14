
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Phone, Mail } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { cn } from '@/lib/utils';

const ClientHealthWidget = () => {
  const { clients } = useClients();

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'needs_attention':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'issues':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const priorityClients = clients
    .filter(client => client.health_status !== 'healthy')
    .slice(0, 5);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          <span>Client Health</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-600">
              {clients.filter(c => c.health_status === 'healthy').length}
            </p>
            <p className="text-xs text-green-600">Healthy</p>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg">
            <p className="text-lg font-bold text-yellow-600">
              {clients.filter(c => c.health_status === 'needs_attention').length}
            </p>
            <p className="text-xs text-yellow-600">Attention</p>
          </div>
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <p className="text-lg font-bold text-red-600">
              {clients.filter(c => c.health_status === 'issues').length}
            </p>
            <p className="text-xs text-red-600">Issues</p>
          </div>
        </div>

        {priorityClients.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Building2 className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-sm font-medium">All clients healthy!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Priority Clients</h4>
            {priorityClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{client.name}</p>
                  <p className="text-xs text-gray-500">{client.company}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={cn("text-xs", getHealthColor(client.health_status))}>
                    {client.health_status?.replace('_', ' ')}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Phone className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientHealthWidget;
